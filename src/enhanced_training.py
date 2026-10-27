"""
Enhanced Training Pipeline — v3.0
===================================
Integrates:
  - Advanced Feature Engineering (6 new features)
  - MLP Deep Learning (TF/Keras) with two architectures
  - Optuna optimization: MLP, XGBoost, LightGBM (100 trials each)
  - Advanced Stacking: 6 base models + LR/XGB meta learner
  - Complete evaluation: Accuracy, Precision, Recall, F1, AUC-ROC,
    PR-AUC, Log Loss, Brier Score
  - Overfitting detection with Train/Val/Test gap reports
  - SHAP explainability: Summary, Bar, Top-20

Run: python run_enhanced_training.py
"""
import os
import sys
import warnings
import json
import logging
import numpy as np
import pandas as pd
from datetime import datetime
from pathlib import Path

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
warnings.filterwarnings("ignore")

import joblib
from sklearn.pipeline import Pipeline
from sklearn.model_selection import (
    train_test_split, StratifiedKFold, cross_validate
)
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, log_loss, brier_score_loss,
    confusion_matrix,
)
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, StackingClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.feature_selection import RFECV
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from catboost import CatBoostClassifier

# Project modules
sys.path.insert(0, str(Path(__file__).parent))
from src.utils import setup_logging
from src.config import (
    RANDOM_STATE, TEST_SIZE, MODELS_DIR, REPORTS_DIR,
    MODEL_PATH, THRESHOLD_PATH, TRAINING_REPORT_PATH,
    COST_FALSE_NEGATIVE, COST_FALSE_POSITIVE,
)
from src.preprocessing import load_and_clean_data, DataCleaner
from src.feature_engineering import (
    AdvancedFeatureEngineer, evaluate_feature_impact, get_advanced_feature_lists
)
from src.deep_learning import (
    KerasMLP, MLPOptimizer, optimize_xgboost, optimize_lightgbm
)
from src.overfitting_shap import (
    print_overfitting_report, plot_overfitting_gaps, run_shap_analysis
)
from src.transformers import RFEMaskTransformer, TransformedWrapper, TransformedWrapperMLP

logger = logging.getLogger("churn_pipeline")


# ─── Data Loading with Advanced Features ────────────────────────────────────

def load_advanced_data(filepath=None):
    """
    Load and apply advanced feature engineering.
    Returns (df, X, y) with all 6 new engineered features.
    """
    from src.config import RAW_DATA_PATH, TARGET_COL, ID_COL
    if filepath is None:
        filepath = RAW_DATA_PATH

    logger.info(f"Loading data from {filepath}")
    df = pd.read_csv(str(filepath))

    # Step 1: Basic cleaning
    cleaner = DataCleaner()
    df = cleaner.transform(df)
    df[TARGET_COL] = df[TARGET_COL].map({"Yes": 1, "No": 0})

    # Step 2: Advanced feature engineering (includes TotalCharges before drop)
    engineer = AdvancedFeatureEngineer()
    df = engineer.transform(df)

    # Step 3: Drop TotalCharges (high VIF with tenure, now captured in AvgMonthlySpend)
    if "TotalCharges" in df.columns:
        df = df.drop(columns=["TotalCharges"])

    y = df[TARGET_COL]
    X = df.drop(columns=[TARGET_COL])

    logger.info(f"Advanced feature shape: {X.shape}")
    logger.info(f"Churn rate: {y.mean()*100:.2f}%")
    logger.info(f"New features: AvgMonthlySpend, CustomerValue, ContractRisk, "
                f"TenureGroup, ServiceCount, ChargesRatio")

    return df, X, y


def build_advanced_preprocessor(X_train: pd.DataFrame) -> ColumnTransformer:
    """Build ColumnTransformer using advanced feature lists."""
    num_cols, bin_cols, cat_cols = get_advanced_feature_lists(X_train)
    logger.info(f"  Numerical ({len(num_cols)}): {num_cols}")
    logger.info(f"  Binary    ({len(bin_cols)}): {bin_cols}")
    logger.info(f"  Categorical ({len(cat_cols)}): {cat_cols}")
    return ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), num_cols),
            ("bin", OneHotEncoder(drop="if_binary", sparse_output=False, handle_unknown="ignore"), bin_cols),
            ("cat", OneHotEncoder(drop="first", sparse_output=False, handle_unknown="ignore"), cat_cols),
        ],
        remainder="drop",
        verbose_feature_names_out=False,
    )


# ─── Full Metric Evaluation ──────────────────────────────────────────────────

def evaluate_model_full(model, X_train, y_train, X_test, y_test, name, threshold=0.5):
    """
    Compute all 8 metrics + overfitting gaps.
    Returns a metrics dict.
    """
    y_train_proba = model.predict_proba(X_train)[:, 1]
    y_test_proba = model.predict_proba(X_test)[:, 1]
    y_test_pred = (y_test_proba >= threshold).astype(int)
    y_train_pred = (y_train_proba >= threshold).astype(int)

    tn, fp, fn, tp = confusion_matrix(y_test, y_test_pred).ravel()

    # All 8 metrics
    metrics = {
        "model": name,
        # Train
        "train_accuracy":  accuracy_score(y_train, y_train_pred),
        "train_recall":    recall_score(y_train, y_train_pred),
        "train_auc_roc":   roc_auc_score(y_train, y_train_proba),
        # Test
        "test_accuracy":   accuracy_score(y_test, y_test_pred),
        "test_precision":  precision_score(y_test, y_test_pred, zero_division=0),
        "test_recall":     recall_score(y_test, y_test_pred),
        "test_f1":         f1_score(y_test, y_test_pred),
        "test_auc_roc":    roc_auc_score(y_test, y_test_proba),
        "test_pr_auc":     average_precision_score(y_test, y_test_proba),
        "test_log_loss":   log_loss(y_test, y_test_proba),
        "brier_score":     brier_score_loss(y_test, y_test_proba),
        # Confusion matrix
        "tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp),
        # Business
        "business_cost":   int(fn * COST_FALSE_NEGATIVE + fp * COST_FALSE_POSITIVE),
    }

    # Overfitting gaps
    metrics["auc_gap"]    = metrics["train_auc_roc"] - metrics["test_auc_roc"]
    metrics["recall_gap"] = metrics["train_recall"]  - metrics["test_recall"]
    gap = max(metrics["auc_gap"], metrics["recall_gap"])
    if gap <= 0.03:
        metrics["overfit_status"] = "✅ OK"
    elif gap <= 0.06:
        metrics["overfit_status"] = "⚠️  MILD"
    elif gap <= 0.10:
        metrics["overfit_status"] = "🟠 MODERATE"
    else:
        metrics["overfit_status"] = "🔴 SEVERE"

    logger.info(
        f"  {name:<35} | Rec={metrics['test_recall']:.3f} | F1={metrics['test_f1']:.3f} | "
        f"AUC={metrics['test_auc_roc']:.3f} | Gap={metrics['auc_gap']:+.3f} | "
        f"{metrics['overfit_status']}"
    )
    return metrics


# ─── Find Optimal Threshold ──────────────────────────────────────────────────

def find_optimal_threshold(model, X_test, y_test):
    y_proba = model.predict_proba(X_test)[:, 1]
    thresholds = np.arange(0.1, 0.9, 0.01)
    best_f1_t, best_f1 = 0.5, 0.0
    results = []
    for t in thresholds:
        y_pred = (y_proba >= t).astype(int)
        tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
        f1 = f1_score(y_test, y_pred, zero_division=0)
        if f1 > best_f1:
            best_f1, best_f1_t = f1, t
        results.append({"threshold": t, "f1": f1,
                        "recall": recall_score(y_test, y_pred),
                        "precision": precision_score(y_test, y_pred, zero_division=0),
                        "cost": fn * COST_FALSE_NEGATIVE + fp * COST_FALSE_POSITIVE,
                        "fn": fn, "fp": fp})
    logger.info(f"  Best F1 threshold: {best_f1_t:.2f} (F1={best_f1:.4f})")
    return best_f1_t, pd.DataFrame(results)


# ─── Advanced Stacking ────────────────────────────────────────────────────────

def build_advanced_stacking(preprocessor, rfe_transformer, scale_pos_weight, mlp_params=None, meta="lr"):
    """
    6-model stacking ensemble with optional MLP base learner.
    meta: 'lr' for LogisticRegression meta, 'xgb' for XGBoost meta.
    """
    base_estimators = [
        ("lr", Pipeline([
            ("pre", preprocessor),
            ("rfe", rfe_transformer),
            ("clf", LogisticRegression(
                class_weight="balanced", C=0.5, max_iter=2000, random_state=RANDOM_STATE
            ))
        ])),
        ("rf", Pipeline([
            ("pre", preprocessor),
            ("rfe", rfe_transformer),
            ("clf", RandomForestClassifier(
                n_estimators=200, max_depth=10, min_samples_leaf=5,
                class_weight="balanced", random_state=RANDOM_STATE, n_jobs=-1
            ))
        ])),
        ("xgb", Pipeline([
            ("pre", preprocessor),
            ("rfe", rfe_transformer),
            ("clf", XGBClassifier(
                n_estimators=200, max_depth=5, learning_rate=0.05,
                gamma=1.0, reg_alpha=0.5, reg_lambda=1.5,
                scale_pos_weight=scale_pos_weight,
                eval_metric="auc", random_state=RANDOM_STATE, n_jobs=-1, verbosity=0
            ))
        ])),
        ("lgbm", Pipeline([
            ("pre", preprocessor),
            ("rfe", rfe_transformer),
            ("clf", LGBMClassifier(
                n_estimators=200, max_depth=7, num_leaves=31,
                learning_rate=0.05, scale_pos_weight=scale_pos_weight,
                random_state=RANDOM_STATE, n_jobs=-1, verbosity=-1
            ))
        ])),
        ("cat", Pipeline([
            ("pre", preprocessor),
            ("rfe", rfe_transformer),
            ("clf", CatBoostClassifier(
                iterations=200, depth=6, learning_rate=0.05,
                l2_leaf_reg=5, eval_metric="AUC",
                auto_class_weights="Balanced",
                random_seed=RANDOM_STATE, verbose=0
            ))
        ])),
    ]

    # Add MLP if enabled
    if mlp_params is not None:
        mlp = KerasMLP(**mlp_params) if isinstance(mlp_params, dict) else mlp_params
        base_estimators.append(("mlp", Pipeline([
            ("pre", preprocessor),
            ("rfe", rfe_transformer),
            ("clf", mlp)
        ])))
        logger.info("  Added MLP as base learner in stacking")

    # Meta learner
    if meta == "xgb":
        meta_clf = XGBClassifier(
            n_estimators=100, max_depth=3, learning_rate=0.1,
            scale_pos_weight=scale_pos_weight,
            eval_metric="auc", random_state=RANDOM_STATE,
            n_jobs=-1, verbosity=0
        )
        logger.info("  Meta learner: XGBoost")
    else:
        meta_clf = LogisticRegression(
            C=0.1, class_weight="balanced", max_iter=1000, random_state=RANDOM_STATE
        )
        logger.info("  Meta learner: Logistic Regression")

    return StackingClassifier(
        estimators=base_estimators,
        final_estimator=meta_clf,
        cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE),
        stack_method="predict_proba",
        passthrough=False,
        n_jobs=1,  # sequential to avoid TF threading issues
    )


# ─── Final Comparison Table ──────────────────────────────────────────────────

def print_final_comparison(results_df: pd.DataFrame) -> pd.DataFrame:
    """Print ranked comparison table for all models."""
    cols = [
        "model", "test_accuracy", "test_precision", "test_recall",
        "test_f1", "test_auc_roc", "test_pr_auc", "test_log_loss",
        "brier_score", "overfit_status"
    ]
    available = [c for c in cols if c in results_df.columns]
    df = results_df[available].copy()

    # Sort by: ROC-AUC (primary), F1 (secondary), Recall (tertiary)
    df = df.sort_values(
        ["test_auc_roc", "test_f1", "test_recall"],
        ascending=False
    ).reset_index(drop=True)

    print("\n" + "=" * 120)
    print("  FINAL MODEL COMPARISON — RANKED BY ROC-AUC → F1 → RECALL")
    print("=" * 120)
    pd.set_option("display.max_colwidth", 40)
    pd.set_option("display.float_format", "{:.4f}".format)
    print(df.to_string(index=True))
    print("=" * 120)

    # Best model recommendation
    viable = df[df["overfit_status"].str.contains("OK|MILD", regex=True)]
    if len(viable) == 0:
        viable = df
    best = viable.iloc[0]
    print(f"\n🏆 RECOMMENDED PRODUCTION MODEL: {best['model']}")
    print(f"   ROC-AUC:  {best['test_auc_roc']:.4f}")
    print(f"   F1-Score: {best['test_f1']:.4f}")
    print(f"   Recall:   {best['test_recall']:.4f}")
    print(f"   Status:   {best['overfit_status']}")
    return df


# ─── Main Enhanced Training Pipeline ────────────────────────────────────────

def run_enhanced_training(
    n_optuna_trials: int = 100,
    run_mlp_optuna: bool = True,
    run_xgb_optuna: bool = True,
    run_lgbm_optuna: bool = True,
    include_mlp_in_stacking: bool = True,
):
    """
    Complete enhanced training pipeline.
    n_optuna_trials: number of Optuna trials per optimizer (default 100)
    """
    logger.info("=" * 70)
    logger.info("  ENHANCED TELCO CHURN — v3.0 ML + DEEP LEARNING PIPELINE")
    logger.info("=" * 70)

    # ── 1. Load data with advanced features ──────────────────────────────
    logger.info("\n[1/12] LOADING & ADVANCED FEATURE ENGINEERING")
    df, X, y = load_advanced_data()
    logger.info(f"  Features: {list(X.columns)}")

    # ── 2. Stratified split ───────────────────────────────────────────────
    logger.info("\n[2/12] TRAIN/TEST SPLIT")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )
    spw = float((y_train == 0).sum() / (y_train == 1).sum())
    logger.info(f"  Train: {X_train.shape[0]} | Test: {X_test.shape[0]}")
    logger.info(f"  Churn rate train: {y_train.mean()*100:.2f}%  test: {y_test.mean()*100:.2f}%")
    logger.info(f"  scale_pos_weight: {spw:.3f}")

    # ── 3. Feature impact test ────────────────────────────────────────────
    logger.info("\n[3/12] FEATURE IMPACT EVALUATION")
    new_feats = ["AvgMonthlySpend", "CustomerValue", "ContractRisk",
                 "ServiceCount", "ChargesRatio"]
    impact_df = evaluate_feature_impact(X_train, y_train, new_feats)
    logger.info(f"\n{impact_df.to_string(index=False)}")
    # Keep only features that don't hurt (neutral or positive delta)
    drop_feats = impact_df[impact_df["recommendation"] == "DROP"]["feature"].tolist()
    if drop_feats:
        logger.info(f"  Dropping degrading features: {drop_feats}")
        X_train = X_train.drop(columns=drop_feats, errors="ignore")
        X_test = X_test.drop(columns=drop_feats, errors="ignore")

    # ── 4. Build preprocessor ────────────────────────────────────────────
    logger.info("\n[4/12] BUILDING PREPROCESSOR")
    preprocessor = build_advanced_preprocessor(X_train)
    preprocessor.fit(X_train)

    # Pre-transform for MLP and Optuna (need numpy arrays)
    X_train_t = preprocessor.transform(X_train).astype(np.float32)
    X_test_t = preprocessor.transform(X_test).astype(np.float32)
    y_train_arr = y_train.values.astype(np.float32)
    y_test_arr = y_test.values.astype(np.float32)
    n_features = X_train_t.shape[1]
    logger.info(f"  Transformed shape: {X_train_t.shape}")

    # ── 4.5 Recursive Feature Elimination (RFE) ─────────────────────────
    logger.info("\n[4.5/12] RECURSIVE FEATURE ELIMINATION (RFE)")
    rfe_estimator = LGBMClassifier(
        n_estimators=100, max_depth=5, learning_rate=0.05,
        scale_pos_weight=spw, random_state=RANDOM_STATE, n_jobs=-1, verbosity=-1
    )
    rfecv = RFECV(
        estimator=rfe_estimator, step=1, 
        cv=StratifiedKFold(3, shuffle=True, random_state=RANDOM_STATE), 
        scoring="roc_auc", n_jobs=-1
    )
    rfecv.fit(X_train_t, y_train_arr)
    
    n_features_selected = rfecv.n_features_
    logger.info(f"  RFE selected {n_features_selected} features out of {n_features}")
    
    X_train_t = rfecv.transform(X_train_t).astype(np.float32)
    X_test_t = rfecv.transform(X_test_t).astype(np.float32)
    
    rfe_transformer = RFEMaskTransformer(rfecv.support_)

    all_results = []
    trained_models = {}

    # ── 5. Baseline models (fast, CV) ────────────────────────────────────
    logger.info("\n[5/12] BASELINE MODELS — CROSS VALIDATION")
    baseline_models = {
        "Logistic Regression": LogisticRegression(
            class_weight="balanced", C=1.0, max_iter=2000, random_state=RANDOM_STATE
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=200, max_depth=10, min_samples_leaf=5,
            class_weight="balanced", random_state=RANDOM_STATE, n_jobs=-1
        ),
        "XGBoost": XGBClassifier(
            n_estimators=300, max_depth=5, learning_rate=0.05,
            gamma=1.0, reg_alpha=0.5, reg_lambda=1.5,
            scale_pos_weight=spw, eval_metric="auc",
            random_state=RANDOM_STATE, n_jobs=-1, verbosity=0
        ),
        "LightGBM": LGBMClassifier(
            n_estimators=300, max_depth=7, num_leaves=31,
            learning_rate=0.05, reg_alpha=0.3, reg_lambda=0.3,
            scale_pos_weight=spw, random_state=RANDOM_STATE,
            n_jobs=-1, verbosity=-1
        ),
        "CatBoost": CatBoostClassifier(
            iterations=300, depth=6, learning_rate=0.05,
            l2_leaf_reg=5, eval_metric="AUC",
            auto_class_weights="Balanced",
            random_seed=RANDOM_STATE, verbose=0
        ),
    }

    for name, clf in baseline_models.items():
        pipe = Pipeline([("pre", preprocessor), ("rfe", rfe_transformer), ("clf", clf)])
        logger.info(f"  Training {name}...")
        pipe.fit(X_train, y_train)
        trained_models[name] = pipe
        metrics = evaluate_model_full(pipe, X_train, y_train, X_test, y_test, name)
        all_results.append(metrics)

    # ── 6. MLP Baseline (Architecture v1 & v2) ────────────────────────────
    logger.info("\n[6/12] MLP DEEP LEARNING BASELINES")
    for arch_name, arch in [("MLP v1", "v1"), ("MLP v2", "v2")]:
        logger.info(f"  Training {arch_name}...")
        mlp = KerasMLP(architecture=arch, epochs=200, random_state=RANDOM_STATE)
        mlp.fit(X_train_t, y_train_arr)
        trained_models[arch_name] = mlp

        wrapped = TransformedWrapper(mlp, preprocessor, rfe_transformer)
        metrics = evaluate_model_full(
            wrapped, X_train, y_train, X_test, y_test, arch_name
        )
        all_results.append(metrics)
        trained_models[arch_name + "_wrapped"] = wrapped

    # ── 7. Optuna XGBoost ─────────────────────────────────────────────────
    logger.info("\n[7/12] XGBOOST OPTUNA OPTIMIZATION")
    if run_xgb_optuna:
        xgb_best_params, xgb_best_auc = optimize_xgboost(
            X_train_t, y_train_arr, spw,
            n_trials=n_optuna_trials, n_folds=5
        )
        xgb_tuned = XGBClassifier(
            **xgb_best_params,
            scale_pos_weight=spw,
            eval_metric="auc",
            random_state=RANDOM_STATE,
            n_jobs=-1,
            verbosity=0,
        )
        xgb_pipe_tuned = Pipeline([("pre", preprocessor), ("rfe", rfe_transformer), ("clf", xgb_tuned)])
        xgb_pipe_tuned.fit(X_train, y_train)
        trained_models["XGBoost (Optuna)"] = xgb_pipe_tuned
        metrics = evaluate_model_full(
            xgb_pipe_tuned, X_train, y_train, X_test, y_test, "XGBoost (Optuna)"
        )
        all_results.append(metrics)
    else:
        xgb_pipe_tuned = trained_models["XGBoost"]
        logger.info("  Skipping XGBoost Optuna (disabled)")

    # ── 8. Optuna LightGBM ────────────────────────────────────────────────
    logger.info("\n[8/12] LIGHTGBM OPTUNA OPTIMIZATION")
    if run_lgbm_optuna:
        lgbm_best_params, lgbm_best_auc = optimize_lightgbm(
            X_train_t, y_train_arr, spw,
            n_trials=n_optuna_trials, n_folds=5
        )
        lgbm_tuned = LGBMClassifier(
            **lgbm_best_params,
            scale_pos_weight=spw,
            random_state=RANDOM_STATE,
            n_jobs=-1,
            verbosity=-1,
        )
        lgbm_pipe_tuned = Pipeline([("pre", preprocessor), ("rfe", rfe_transformer), ("clf", lgbm_tuned)])
        lgbm_pipe_tuned.fit(X_train, y_train)
        trained_models["LightGBM (Optuna)"] = lgbm_pipe_tuned
        metrics = evaluate_model_full(
            lgbm_pipe_tuned, X_train, y_train, X_test, y_test, "LightGBM (Optuna)"
        )
        all_results.append(metrics)
    else:
        lgbm_pipe_tuned = trained_models["LightGBM"]
        logger.info("  Skipping LightGBM Optuna (disabled)")

    # ── 9. Optuna MLP ─────────────────────────────────────────────────────
    logger.info("\n[9/12] MLP OPTUNA OPTIMIZATION")
    if run_mlp_optuna:
        mlp_optimizer = MLPOptimizer(
            X_train_t, y_train_arr,
            n_trials=n_optuna_trials, n_folds=3
        )
        mlp_best_params = mlp_optimizer.optimize()
        mlp_best = mlp_optimizer.build_best_model()
        mlp_best.fit(X_train_t, y_train_arr)
        trained_models["MLP (Optuna)"] = mlp_best

        mlp_wrapped = TransformedWrapperMLP(mlp_best, preprocessor, rfe_transformer)
        metrics = evaluate_model_full(
            mlp_wrapped, X_train, y_train, X_test, y_test, "MLP (Optuna)"
        )
        all_results.append(metrics)
        trained_models["MLP (Optuna)_wrapped"] = mlp_wrapped
    else:
        mlp_best = None
        mlp_best_params = None
        logger.info("  Skipping MLP Optuna (disabled)")

    # ── 10. Advanced Stacking (6 base models) ────────────────────────────
    logger.info("\n[10/12] ADVANCED STACKING ENSEMBLE")

    # Stacking with LR meta
    logger.info("  Building Stacking (meta=LR)...")
    stacking_lr = build_advanced_stacking(
        preprocessor, rfe_transformer, spw,
        mlp_params=mlp_best if include_mlp_in_stacking and mlp_best is not None else None,
        meta="lr"
    )
    stacking_lr.fit(X_train, y_train)
    trained_models["Stacking (meta=LR)"] = stacking_lr
    metrics = evaluate_model_full(
        stacking_lr, X_train, y_train, X_test, y_test, "Stacking (meta=LR)"
    )
    all_results.append(metrics)

    # Stacking with XGB meta
    logger.info("  Building Stacking (meta=XGB)...")
    stacking_xgb = build_advanced_stacking(
        preprocessor, rfe_transformer, spw,
        mlp_params=mlp_best if include_mlp_in_stacking and mlp_best is not None else None,
        meta="xgb"
    )
    stacking_xgb.fit(X_train, y_train)
    trained_models["Stacking (meta=XGB)"] = stacking_xgb
    metrics = evaluate_model_full(
        stacking_xgb, X_train, y_train, X_test, y_test, "Stacking (meta=XGB)"
    )
    all_results.append(metrics)

    # ── 11. Threshold optimization & calibration ──────────────────────────
    logger.info("\n[11/12] THRESHOLD OPTIMIZATION & CALIBRATION")
    results_df = pd.DataFrame(all_results)

    # Pick best model for threshold opt: highest test AUC
    best_idx = results_df["test_auc_roc"].idxmax()
    best_name = results_df.loc[best_idx, "model"]
    best_pipeline = trained_models[best_name]
    logger.info(f"  Best model for threshold opt: {best_name}")

    optimal_threshold, thresh_df = find_optimal_threshold(best_pipeline, X_test, y_test)

    # Calibration on best tree model (not MLP/Stacking)
    tree_models = [n for n in ["LightGBM (Optuna)", "XGBoost (Optuna)", "LightGBM", "XGBoost"]
                   if n in trained_models]
    if tree_models:
        calib_source_name = tree_models[0]
        calib_source = trained_models[calib_source_name]
        cal_model = CalibratedClassifierCV(
            calib_source.best_estimator_ if hasattr(calib_source, "best_estimator_") else calib_source,
            method="isotonic", cv=5
        )
        cal_model.fit(X_train, y_train)
        trained_models[f"{calib_source_name} (Calibrated)"] = cal_model
        metrics = evaluate_model_full(
            cal_model, X_train, y_train, X_test, y_test,
            f"{calib_source_name} (Calibrated)"
        )
        all_results.append(metrics)

    results_df = pd.DataFrame(all_results)

    # ── 12. Reports & SHAP ────────────────────────────────────────────────
    logger.info("\n[12/12] REPORTS & SHAP EXPLAINABILITY")

    # Final comparison table
    final_df = print_final_comparison(results_df)

    # Overfitting report
    print_overfitting_report(results_df)

    # Overfitting gap plot
    try:
        plot_overfitting_gaps(results_df)
    except Exception as e:
        logger.warning(f"  Overfitting plot failed: {e}")

    # SHAP on best viable model (prefer tree model for speed)
    shap_model_name = None
    for candidate in ["LightGBM (Optuna)", "XGBoost (Optuna)", "LightGBM", "XGBoost", best_name]:
        if candidate in trained_models:
            shap_model_name = candidate
            break

    if shap_model_name:
        try:
            run_shap_analysis(
                trained_models[shap_model_name],
                X_train, X_test,
                model_name=shap_model_name,
            )
        except Exception as e:
            logger.warning(f"  SHAP analysis failed: {e}")

    # ── Save best model ────────────────────────────────────────────────────
    MODELS_DIR.mkdir(exist_ok=True)
    REPORTS_DIR.mkdir(exist_ok=True)

    # Select production model: best ROC-AUC with OK/MILD overfitting
    viable = results_df[results_df["overfit_status"].str.contains("OK|MILD", regex=True, na=False)]
    if len(viable) == 0:
        viable = results_df
    prod_idx = viable.sort_values(
        ["test_auc_roc", "test_f1", "test_recall"], ascending=False
    ).index[0]
    prod_name = results_df.loc[prod_idx, "model"]
    prod_model = trained_models.get(prod_name + "_wrapped", trained_models.get(prod_name))

    joblib.dump(prod_model, MODEL_PATH)
    logger.info(f"\n  ✅ Production model saved: {prod_name} → {MODEL_PATH}")

    config = {
        "threshold": float(optimal_threshold),
        "trained_on": datetime.now().isoformat(),
        "model": prod_name,
        "version": "3.0.0",
        "features": list(X_train.columns),
        "metrics": {
            "test_recall":    float(results_df.loc[prod_idx, "test_recall"]),
            "test_f1":        float(results_df.loc[prod_idx, "test_f1"]),
            "test_auc":       float(results_df.loc[prod_idx, "test_auc_roc"]),
            "test_precision": float(results_df.loc[prod_idx, "test_precision"]),
        }
    }
    with open(THRESHOLD_PATH, "w") as f:
        json.dump(config, f, indent=2)

    report = {
        "trained_on": datetime.now().isoformat(),
        "best_model": prod_name,
        "optimal_threshold": float(optimal_threshold),
        "all_results": results_df.to_dict(orient="records"),
        "feature_impact": impact_df.to_dict(orient="records") if "impact_df" in dir() else [],
    }
    with open(TRAINING_REPORT_PATH, "w") as f:
        json.dump(report, f, indent=2, default=str)

    logger.info(f"  Config  → {THRESHOLD_PATH}")
    logger.info(f"  Report  → {TRAINING_REPORT_PATH}")

    return {
        "results_df": results_df,
        "final_df": final_df,
        "trained_models": trained_models,
        "best_name": prod_name,
        "best_model": prod_model,
        "threshold": optimal_threshold,
        "X_train": X_train, "X_test": X_test,
        "y_train": y_train, "y_test": y_test,
        "X_train_t": X_train_t, "X_test_t": X_test_t,
        "preprocessor": preprocessor,
        "thresh_df": thresh_df,
        "impact_df": impact_df,
    }
