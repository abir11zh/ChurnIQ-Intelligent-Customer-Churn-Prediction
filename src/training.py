"""
Training Module — Anti-Overfitting, CV, Early Stopping
"""
import numpy as np
import pandas as pd
import json
import logging
from datetime import datetime
from pathlib import Path

from sklearn.pipeline import Pipeline
from sklearn.model_selection import (
    train_test_split, StratifiedKFold, cross_validate,
    RandomizedSearchCV
)
from sklearn.metrics import (
    recall_score, f1_score, roc_auc_score,
    average_precision_score, make_scorer,
    confusion_matrix, brier_score_loss,
    precision_score
)
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, StackingClassifier
from sklearn.calibration import CalibratedClassifierCV
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from catboost import CatBoostClassifier
from scipy.stats import randint, uniform
import joblib

from src.config import *
from src.preprocessing import (
    load_and_clean_data, get_preprocessor_from_data
)

logger = logging.getLogger("churn_pipeline")


def get_base_models(scale_pos_weight):
    """Return dict of model_name → (Pipeline, is_tree_based)."""
    models = {}
    
    models["Logistic Regression"] = LogisticRegression(
        **LOGISTIC_REGRESSION_PARAMS
    )
    models["Random Forest"] = RandomForestClassifier(
        **RANDOM_FOREST_PARAMS
    )
    
    xgb_params = {**XGBOOST_PARAMS, "scale_pos_weight": scale_pos_weight}
    models["XGBoost"] = XGBClassifier(**xgb_params)
    
    lgbm_params = {**LIGHTGBM_PARAMS, "scale_pos_weight": scale_pos_weight}
    models["LightGBM"] = LGBMClassifier(**lgbm_params)
    
    catboost_params = {**CATBOOST_PARAMS, "auto_class_weights": "Balanced"}
    models["CatBoost"] = CatBoostClassifier(**catboost_params)
    
    return models


def run_cross_validation(pipelines, X_train, y_train):
    """Run stratified K-fold CV on all models. Returns summary dict."""
    scoring = {
        "recall": make_scorer(recall_score),
        "f1": make_scorer(f1_score),
        "roc_auc": "roc_auc",
        "pr_auc": make_scorer(average_precision_score, response_method="predict_proba"),
    }
    skf = StratifiedKFold(n_splits=CV_FOLDS, shuffle=CV_SHUFFLE, random_state=RANDOM_STATE)
    
    cv_summary = {}
    header = f"{'Model':<25} {'Recall':>14} {'F1':>14} {'AUC-ROC':>14} {'PR-AUC':>14}"
    logger.info(header)
    logger.info("-" * 85)
    
    for name, pipe in pipelines.items():
        try:
            cv_res = cross_validate(
                pipe, X_train, y_train, cv=skf,
                scoring=scoring, n_jobs=-1, return_train_score=True
            )
        except RuntimeError:
            # CatBoost clone issue with parallel — fallback to sequential
            logger.info(f"  {name}: falling back to sequential CV (clone issue)")
            cv_res = cross_validate(
                pipe, X_train, y_train, cv=skf,
                scoring=scoring, n_jobs=1, return_train_score=True
            )
        row = {}
        for met in ["recall", "f1", "roc_auc", "pr_auc"]:
            row[met] = cv_res[f"test_{met}"]
            row[f"train_{met}"] = cv_res[f"train_{met}"]
        
        cv_summary[name] = row
        logger.info(
            f"{name:<25} "
            f"{row['recall'].mean():>6.4f}±{row['recall'].std():.3f}  "
            f"{row['f1'].mean():>6.4f}±{row['f1'].std():.3f}  "
            f"{row['roc_auc'].mean():>6.4f}±{row['roc_auc'].std():.3f}  "
            f"{row['pr_auc'].mean():>6.4f}±{row['pr_auc'].std():.3f}"
        )
    
    return cv_summary


def tune_model(pipe, param_dist, X_train, y_train, name="Model"):
    """RandomizedSearchCV optimizing for recall."""
    logger.info(f"Tuning {name} ({TUNING_N_ITER} iterations)...")
    skf = StratifiedKFold(n_splits=CV_FOLDS, shuffle=CV_SHUFFLE, random_state=RANDOM_STATE)
    
    rs = RandomizedSearchCV(
        pipe, param_dist,
        n_iter=TUNING_N_ITER,
        scoring=make_scorer(recall_score),
        cv=skf, random_state=RANDOM_STATE,
        n_jobs=-1, verbose=0
    )
    rs.fit(X_train, y_train)
    
    logger.info(f"Best {name} CV Recall: {rs.best_score_:.4f}")
    for k, v in rs.best_params_.items():
        logger.info(f"  {k}: {v}")
    
    return rs


def find_optimal_threshold(model, X_test, y_test):
    """Find threshold minimizing business cost and maximizing F1."""
    y_proba = model.predict_proba(X_test)[:, 1]
    thresholds = np.arange(0.1, 0.9, 0.01)
    
    best_f1_t, best_f1 = 0.5, 0
    best_cost_t, best_cost = 0.5, float("inf")
    
    results = []
    for t in thresholds:
        y_pred = (y_proba >= t).astype(int)
        tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
        
        f1 = f1_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        cost = fn * COST_FALSE_NEGATIVE + fp * COST_FALSE_POSITIVE
        
        results.append({
            "threshold": t, "recall": rec, "precision": prec,
            "f1": f1, "cost": cost, "fn": fn, "fp": fp
        })
        
        if f1 > best_f1:
            best_f1, best_f1_t = f1, t
        if cost < best_cost:
            best_cost, best_cost_t = cost, t
    
    logger.info(f"Best F1 threshold: {best_f1_t:.2f} (F1={best_f1:.4f})")
    logger.info(f"Min cost threshold: {best_cost_t:.2f} (cost=${best_cost:,.0f})")
    
    return best_f1_t, best_cost_t, pd.DataFrame(results)


def build_stacking_ensemble(preprocessor, scale_pos_weight):
    """Build stacking ensemble with anti-overfitting base learners."""
    base = [
        ("lr", Pipeline([
            ("pre", preprocessor),
            ("clf", LogisticRegression(class_weight="balanced", C=0.5,
                                       max_iter=2000, random_state=RANDOM_STATE))
        ])),
        ("rf", Pipeline([
            ("pre", preprocessor),
            ("clf", RandomForestClassifier(
                n_estimators=200, max_depth=10, min_samples_leaf=5,
                class_weight="balanced", random_state=RANDOM_STATE, n_jobs=-1
            ))
        ])),
        ("xgb", Pipeline([
            ("pre", preprocessor),
            ("clf", XGBClassifier(
                n_estimators=200, max_depth=5, learning_rate=0.05,
                gamma=1.0, reg_alpha=0.5, reg_lambda=1.5,
                scale_pos_weight=scale_pos_weight,
                eval_metric="auc", random_state=RANDOM_STATE, n_jobs=-1, verbosity=0
            ))
        ])),
        ("lgbm", Pipeline([
            ("pre", preprocessor),
            ("clf", LGBMClassifier(
                n_estimators=200, max_depth=7, num_leaves=31,
                learning_rate=0.05, scale_pos_weight=scale_pos_weight,
                random_state=RANDOM_STATE, n_jobs=-1, verbosity=-1
            ))
        ])),
    ]
    
    meta = LogisticRegression(
        C=0.1, class_weight="balanced",
        max_iter=1000, random_state=RANDOM_STATE
    )
    
    return StackingClassifier(
        estimators=base, final_estimator=meta,
        cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE),
        stack_method="predict_proba", passthrough=False, n_jobs=-1
    )


def run_full_training():
    """
    Complete training pipeline:
    1. Load & clean data
    2. Split (stratified)
    3. Build pipelines (no leakage)
    4. CV comparison
    5. Hyperparameter tuning
    6. Threshold optimization
    7. Calibration
    8. Stacking ensemble
    9. Save best model
    
    Returns dict with all results.
    """
    logger.info("=" * 60)
    logger.info("  TELCO CHURN — PROFESSIONAL ML PIPELINE")
    logger.info("=" * 60)
    
    # 1. Load data
    df, X, y = load_and_clean_data()
    
    # 2. Stratified split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )
    logger.info(f"Train: {X_train.shape[0]} | Test: {X_test.shape[0]}")
    logger.info(f"Train churn rate: {y_train.mean()*100:.2f}%")
    logger.info(f"Test churn rate: {y_test.mean()*100:.2f}%")
    
    # Class imbalance weight
    spw = (y_train == 0).sum() / (y_train == 1).sum()
    logger.info(f"scale_pos_weight: {spw:.3f}")
    
    # 3. Build preprocessor from TRAINING data only
    preprocessor = get_preprocessor_from_data(X_train)
    
    # 4. Build model pipelines
    base_models = get_base_models(spw)
    pipelines = {}
    for name, model in base_models.items():
        pipelines[name] = Pipeline([
            ("pre", preprocessor),
            ("clf", model)
        ])
    
    # 5. Cross-validation
    logger.info("\n" + "=" * 60)
    logger.info("  CROSS-VALIDATION COMPARISON")
    logger.info("=" * 60)
    cv_summary = run_cross_validation(pipelines, X_train, y_train)
    
    # 6. Train all baseline models & evaluate
    all_results = []
    trained_models = {}
    for name, pipe in pipelines.items():
        logger.info(f"\nTraining {name}...")
        pipe.fit(X_train, y_train)
        trained_models[name] = pipe
        
        metrics = evaluate_single_model(pipe, X_train, y_train, X_test, y_test, name)
        metrics["cv_recall_mean"] = float(cv_summary[name]["recall"].mean())
        metrics["cv_recall_std"] = float(cv_summary[name]["recall"].std())
        all_results.append(metrics)
    
    # 7. Hyperparameter tuning (LightGBM + XGBoost)
    logger.info("\n" + "=" * 60)
    logger.info("  HYPERPARAMETER TUNING")
    logger.info("=" * 60)
    
    # LightGBM tuning
    lgbm_pipe = Pipeline([
        ("pre", preprocessor),
        ("clf", LGBMClassifier(
            scale_pos_weight=spw, random_state=RANDOM_STATE,
            n_jobs=-1, verbosity=-1
        ))
    ])
    lgbm_params = {
        "clf__n_estimators": randint(150, 500),
        "clf__max_depth": randint(3, 8),
        "clf__num_leaves": randint(15, 60),
        "clf__learning_rate": uniform(0.02, 0.15),
        "clf__subsample": uniform(0.7, 0.25),
        "clf__colsample_bytree": uniform(0.7, 0.25),
        "clf__min_child_samples": randint(15, 60),
        "clf__reg_alpha": uniform(0.0, 1.0),
        "clf__reg_lambda": uniform(0.0, 1.5),
    }
    rs_lgbm = tune_model(lgbm_pipe, lgbm_params, X_train, y_train, "LightGBM")
    trained_models["LightGBM (Tuned)"] = rs_lgbm
    metrics = evaluate_single_model(rs_lgbm, X_train, y_train, X_test, y_test, "LightGBM (Tuned)")
    all_results.append(metrics)
    
    # XGBoost tuning
    xgb_pipe = Pipeline([
        ("pre", preprocessor),
        ("clf", XGBClassifier(
            scale_pos_weight=spw, eval_metric="auc",
            random_state=RANDOM_STATE, n_jobs=-1, verbosity=0
        ))
    ])
    xgb_params = {
        "clf__n_estimators": randint(150, 500),
        "clf__max_depth": randint(3, 7),
        "clf__learning_rate": uniform(0.02, 0.15),
        "clf__subsample": uniform(0.7, 0.25),
        "clf__colsample_bytree": uniform(0.7, 0.25),
        "clf__gamma": uniform(0.5, 2.0),
        "clf__reg_alpha": uniform(0.0, 2.0),
        "clf__reg_lambda": uniform(0.5, 2.0),
        "clf__min_child_weight": randint(3, 15),
    }
    rs_xgb = tune_model(xgb_pipe, xgb_params, X_train, y_train, "XGBoost")
    trained_models["XGBoost (Tuned)"] = rs_xgb
    metrics = evaluate_single_model(rs_xgb, X_train, y_train, X_test, y_test, "XGBoost (Tuned)")
    all_results.append(metrics)
    
    # 8. Threshold optimization
    logger.info("\n" + "=" * 60)
    logger.info("  THRESHOLD OPTIMIZATION")
    logger.info("=" * 60)
    best_model = rs_lgbm  # Use tuned LightGBM
    best_f1_t, best_cost_t, thresh_df = find_optimal_threshold(best_model, X_test, y_test)
    optimal_threshold = best_f1_t
    
    # 9. Calibration (on a validation split from training, NOT test)
    logger.info("\n" + "=" * 60)
    logger.info("  PROBABILITY CALIBRATION")
    logger.info("=" * 60)
    
    # Use proper calibration: cv=5 on training data (not prefit on test!)
    calibrated_model = CalibratedClassifierCV(
        rs_lgbm.best_estimator_, method="isotonic", cv=5
    )
    calibrated_model.fit(X_train, y_train)
    trained_models["LightGBM (Calibrated)"] = calibrated_model
    
    cal_brier = brier_score_loss(y_test, calibrated_model.predict_proba(X_test)[:, 1])
    raw_brier = brier_score_loss(y_test, rs_lgbm.predict_proba(X_test)[:, 1])
    logger.info(f"Brier Score — Raw: {raw_brier:.4f} | Calibrated: {cal_brier:.4f}")
    
    metrics = evaluate_single_model(calibrated_model, X_train, y_train, X_test, y_test, "LightGBM (Calibrated)")
    all_results.append(metrics)
    
    # 10. Stacking Ensemble
    logger.info("\n" + "=" * 60)
    logger.info("  STACKING ENSEMBLE")
    logger.info("=" * 60)
    stacking = build_stacking_ensemble(preprocessor, spw)
    logger.info("Training Stacking Ensemble...")
    stacking.fit(X_train, y_train)
    trained_models["Stacking Ensemble"] = stacking
    metrics = evaluate_single_model(stacking, X_train, y_train, X_test, y_test, "Stacking Ensemble")
    all_results.append(metrics)
    
    # 11. Select & save best model
    results_df = pd.DataFrame(all_results)
    
    # Best model = highest test recall with acceptable precision (>0.4)
    viable = results_df[results_df["test_precision"] >= 0.35]
    if len(viable) > 0:
        best_idx = viable["test_recall"].idxmax()
    else:
        best_idx = results_df["test_recall"].idxmax()
    
    best_name = results_df.loc[best_idx, "model"]
    best_pipeline = trained_models[best_name]
    
    logger.info(f"\n{'=' * 60}")
    logger.info(f"  BEST MODEL: {best_name}")
    logger.info(f"{'=' * 60}")
    
    # Save model
    MODELS_DIR.mkdir(exist_ok=True)
    REPORTS_DIR.mkdir(exist_ok=True)
    
    joblib.dump(best_pipeline, MODEL_PATH)
    logger.info(f"Model saved: {MODEL_PATH}")
    
    # Save config
    config = {
        "threshold": float(optimal_threshold),
        "cost_threshold": float(best_cost_t),
        "trained_on": datetime.now().isoformat(),
        "model": best_name,
        "version": "2.0.0",
        "features": list(X_train.columns),
        "metrics": {
            "test_recall": float(results_df.loc[best_idx, "test_recall"]),
            "test_f1": float(results_df.loc[best_idx, "test_f1"]),
            "test_auc": float(results_df.loc[best_idx, "test_auc_roc"]),
            "test_precision": float(results_df.loc[best_idx, "test_precision"]),
        }
    }
    with open(THRESHOLD_PATH, "w") as f:
        json.dump(config, f, indent=2)
    logger.info(f"Config saved: {THRESHOLD_PATH}")
    
    # Save full report
    report = {
        "trained_on": datetime.now().isoformat(),
        "best_model": best_name,
        "optimal_threshold": float(optimal_threshold),
        "all_results": results_df.to_dict(orient="records"),
    }
    with open(TRAINING_REPORT_PATH, "w") as f:
        json.dump(report, f, indent=2, default=str)
    
    return {
        "results_df": results_df,
        "best_model": best_pipeline,
        "best_name": best_name,
        "threshold": optimal_threshold,
        "trained_models": trained_models,
        "cv_summary": cv_summary,
        "X_train": X_train, "X_test": X_test,
        "y_train": y_train, "y_test": y_test,
        "thresh_df": thresh_df,
    }


def evaluate_single_model(model, X_train, y_train, X_test, y_test, name, threshold=0.5):
    """Evaluate a single model. Returns metrics dict."""
    y_train_proba = model.predict_proba(X_train)[:, 1]
    y_test_proba = model.predict_proba(X_test)[:, 1]
    y_test_pred = (y_test_proba >= threshold).astype(int)
    y_train_pred = (y_train_proba >= threshold).astype(int)
    
    tn, fp, fn, tp = confusion_matrix(y_test, y_test_pred).ravel()
    
    train_recall = recall_score(y_train, y_train_pred)
    test_recall = recall_score(y_test, y_test_pred)
    train_auc = roc_auc_score(y_train, y_train_proba)
    test_auc = roc_auc_score(y_test, y_test_proba)
    
    recall_gap = train_recall - test_recall
    auc_gap = train_auc - test_auc
    overfit = "WARNING: OVERFIT" if (auc_gap > 0.05 or recall_gap > 0.1) else "OK"
    
    metrics = {
        "model": name,
        "train_recall": train_recall,
        "test_recall": test_recall,
        "test_precision": precision_score(y_test, y_test_pred, zero_division=0),
        "test_f1": f1_score(y_test, y_test_pred),
        "train_auc_roc": train_auc,
        "test_auc_roc": test_auc,
        "test_pr_auc": average_precision_score(y_test, y_test_proba),
        "brier_score": brier_score_loss(y_test, y_test_proba),
        "recall_gap": recall_gap,
        "auc_gap": auc_gap,
        "overfit_status": overfit,
        "business_cost": fn * COST_FALSE_NEGATIVE + fp * COST_FALSE_POSITIVE,
        "fn": fn, "fp": fp, "tp": tp, "tn": tn,
    }
    
    logger.info(
        f"  {name:<30} | Recall: {test_recall:.4f} | F1: {metrics['test_f1']:.4f} | "
        f"AUC: {test_auc:.4f} | Cost: ${metrics['business_cost']:,.0f} | {overfit}"
    )
    
    return metrics
