"""
Train lightweight production-ready ChurnIQ model registry.

This script creates real, loadable sklearn-compatible pipelines for the manual
prediction interface. It intentionally keeps training compact so it can be run
locally from the project folder without the long benchmark workflow.
"""
from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

import joblib
import pandas as pd
from catboost import CatBoostClassifier
from lightgbm import LGBMClassifier
from sklearn.ensemble import ExtraTreesClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.tree import DecisionTreeClassifier
from xgboost import XGBClassifier

from src.config import MODELS_DIR, MODEL_PATH, RANDOM_STATE, RAW_DATA_PATH, TEST_SIZE, THRESHOLD_PATH
from src.preprocessing import (
    DataCleaner,
    FeatureEngineer,
    build_scale_preprocessor,
    build_tree_preprocessor,
    get_feature_lists,
)


REGISTRY_PATH = MODELS_DIR / "model_registry.pkl"


def load_training_frame() -> tuple[pd.DataFrame, pd.Series]:
    raw = pd.read_csv(RAW_DATA_PATH)
    cleaned = DataCleaner().transform(raw)
    cleaned["Churn"] = cleaned["Churn"].map({"Yes": 1, "No": 0})
    engineered = FeatureEngineer().transform(cleaned)
    if "TotalCharges" in engineered.columns:
        engineered = engineered.drop(columns=["TotalCharges"])
    y = engineered["Churn"].astype(int)
    X = engineered.drop(columns=["Churn"])
    return X, y


def evaluate_model(model, X_train, X_test, y_train, y_test, name: str) -> dict:
    y_train_proba = model.predict_proba(X_train)[:, 1]
    y_test_proba = model.predict_proba(X_test)[:, 1]
    y_pred = (y_test_proba >= 0.5).astype(int)
    return {
        "model": name,
        "train_auc_roc": float(roc_auc_score(y_train, y_train_proba)),
        "test_accuracy": float(accuracy_score(y_test, y_pred)),
        "test_precision": float(precision_score(y_test, y_pred, zero_division=0)),
        "test_recall": float(recall_score(y_test, y_pred)),
        "test_f1": float(f1_score(y_test, y_pred)),
        "test_auc_roc": float(roc_auc_score(y_test, y_test_proba)),
        "test_pr_auc": float(average_precision_score(y_test, y_test_proba)),
    }


def main() -> None:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    X, y = load_training_frame()
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    scale_pos_weight = float((y_train == 0).sum() / (y_train == 1).sum())
    num_cols, bin_cols, cat_cols = get_feature_lists(X_train)
    scale_pre = build_scale_preprocessor(num_cols, bin_cols, cat_cols, scaler_name="standard")
    tree_pre = build_tree_preprocessor(num_cols, bin_cols, cat_cols)

    candidates = {
        "Logistic Regression": Pipeline([
            ("pre", scale_pre),
            ("clf", LogisticRegression(class_weight="balanced", max_iter=1200, random_state=RANDOM_STATE)),
        ]),
        "Decision Tree": Pipeline([
            ("pre", tree_pre),
            ("clf", DecisionTreeClassifier(max_depth=7, min_samples_leaf=12, class_weight="balanced", random_state=RANDOM_STATE)),
        ]),
        "Random Forest": Pipeline([
            ("pre", tree_pre),
            ("clf", RandomForestClassifier(n_estimators=160, max_depth=10, min_samples_leaf=6, class_weight="balanced", random_state=RANDOM_STATE, n_jobs=-1)),
        ]),
        "Extra Trees": Pipeline([
            ("pre", tree_pre),
            ("clf", ExtraTreesClassifier(n_estimators=180, max_depth=10, min_samples_leaf=6, class_weight="balanced", random_state=RANDOM_STATE, n_jobs=-1)),
        ]),
        "XGBoost": Pipeline([
            ("pre", tree_pre),
            ("clf", XGBClassifier(n_estimators=180, max_depth=4, learning_rate=0.05, subsample=0.85, colsample_bytree=0.85, scale_pos_weight=scale_pos_weight, eval_metric="auc", random_state=RANDOM_STATE, n_jobs=-1, verbosity=0)),
        ]),
        "LightGBM": Pipeline([
            ("pre", tree_pre),
            ("clf", LGBMClassifier(n_estimators=220, max_depth=6, num_leaves=24, learning_rate=0.05, subsample=0.85, colsample_bytree=0.85, scale_pos_weight=scale_pos_weight, random_state=RANDOM_STATE, n_jobs=-1, verbosity=-1)),
        ]),
        "CatBoost": Pipeline([
            ("pre", tree_pre),
            ("clf", CatBoostClassifier(iterations=220, depth=5, learning_rate=0.05, auto_class_weights="Balanced", random_seed=RANDOM_STATE, verbose=0)),
        ]),
    }

    trained_models = {}
    metrics = []
    for name, pipeline in candidates.items():
        print(f"Training {name}...")
        pipeline.fit(X_train, y_train)
        trained_models[name] = pipeline
        metrics.append(evaluate_model(pipeline, X_train, X_test, y_train, y_test, name))

    metrics = sorted(metrics, key=lambda row: row["test_auc_roc"], reverse=True)
    default_model = metrics[0]["model"]
    threshold = 0.5
    if THRESHOLD_PATH.exists():
      try:
          threshold = float(json.loads(THRESHOLD_PATH.read_text(encoding="utf-8")).get("threshold", threshold))
      except Exception:
          threshold = 0.5

    registry = {
        "version": "4.0.0",
        "trained_on": datetime.now().isoformat(),
        "default_model": default_model,
        "threshold": threshold,
        "feature_columns": list(X.columns),
        "models": trained_models,
        "metrics": metrics,
    }
    joblib.dump(registry, REGISTRY_PATH)
    joblib.dump(trained_models[default_model], MODEL_PATH)

    config = {
        "threshold": threshold,
        "trained_on": registry["trained_on"],
        "model": default_model,
        "version": registry["version"],
        "features": list(X.columns),
        "metrics": {
            "test_recall": metrics[0]["test_recall"],
            "test_f1": metrics[0]["test_f1"],
            "test_auc": metrics[0]["test_auc_roc"],
            "test_precision": metrics[0]["test_precision"],
        },
        "available_models": [row["model"] for row in metrics],
    }
    THRESHOLD_PATH.write_text(json.dumps(config, indent=2), encoding="utf-8")
    print(f"Saved registry: {REGISTRY_PATH}")
    print(f"Saved default model: {MODEL_PATH}")
    print(f"Default model: {default_model}")


if __name__ == "__main__":
    main()
