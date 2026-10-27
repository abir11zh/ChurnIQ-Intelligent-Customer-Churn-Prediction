"""
Central Configuration — Telco Churn Prediction System
=====================================================
Single source of truth for all hyperparameters, paths, and constants.
No magic numbers scattered across the codebase.
"""

import os
from pathlib import Path

# ─── Paths ──────────────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
MODELS_DIR = PROJECT_ROOT / "models"
REPORTS_DIR = PROJECT_ROOT / "reports"
RAW_DATA_PATH = DATA_DIR / "WA_Fn-UseC_-Telco-Customer-Churn.csv"

# Also check root for the CSV (backward compatibility)
if not RAW_DATA_PATH.exists():
    alt_path = PROJECT_ROOT / "WA_Fn-UseC_-Telco-Customer-Churn.csv"
    if alt_path.exists():
        RAW_DATA_PATH = alt_path

MODEL_PATH = MODELS_DIR / "churn_pipeline.pkl"
THRESHOLD_PATH = MODELS_DIR / "threshold_config.json"
TRAINING_REPORT_PATH = REPORTS_DIR / "training_report.json"

# ─── Academic Benchmark Paths ───────────────────────────────────────────────
RESULTS_DIR = PROJECT_ROOT / "results"
FIGURES_DIR = REPORTS_DIR / "figures"
SCALER_COMPARISON_PATH = RESULTS_DIR / "scaler_comparison.csv"
FINAL_BENCHMARK_PATH = RESULTS_DIR / "final_benchmark.csv"
EARLY_STOPPING_REPORT_PATH = RESULTS_DIR / "early_stopping_results.json"
FINAL_ANALYSIS_PATH = REPORTS_DIR / "final_analysis.md"
FINAL_RECOMMENDATIONS_PATH = REPORTS_DIR / "final_recommendations.md"
AUDIT_REPORT_PATH = REPORTS_DIR / "audit_report.md"

# ─── Reproducibility ────────────────────────────────────────────────────────
RANDOM_STATE = 42
TEST_SIZE = 0.2

# ─── Feature Configuration ──────────────────────────────────────────────────
TARGET_COL = "Churn"
ID_COL = "customerID"

NUMERICAL_FEATURES = ["tenure", "MonthlyCharges", "TotalCharges"]

BINARY_FEATURES = [
    "gender", "SeniorCitizen", "Partner", "Dependents",
    "PhoneService", "PaperlessBilling"
]

CATEGORICAL_FEATURES = [
    "MultipleLines", "InternetService", "OnlineSecurity", "OnlineBackup",
    "DeviceProtection", "TechSupport", "StreamingTV", "StreamingMovies",
    "Contract", "PaymentMethod"
]

# Services used for NoServices feature engineering
SERVICE_COLUMNS = [
    "OnlineSecurity", "OnlineBackup", "DeviceProtection",
    "TechSupport", "StreamingTV", "StreamingMovies"
]

# ─── Cross-Validation ───────────────────────────────────────────────────────
CV_FOLDS = 5
CV_SHUFFLE = True

# ─── Business Cost Matrix ───────────────────────────────────────────────────
COST_FALSE_NEGATIVE = 500   # USD — missed churner → lost revenue
COST_FALSE_POSITIVE = 50    # USD — false alarm → unnecessary retention offer
CUSTOMER_LTV = 2000         # Average Customer Lifetime Value
RETENTION_SUCCESS_RATE = 0.30  # Probability retention offer works
RETENTION_CAMPAIGN_COST = 50

# ─── Model Hyperparameters (Anti-Overfitting) ───────────────────────────────
# These are carefully tuned defaults. Tuning will search around these.

LOGISTIC_REGRESSION_PARAMS = {
    "C": 1.0,
    "class_weight": "balanced",
    "max_iter": 2000,
    "random_state": RANDOM_STATE,
}

RANDOM_FOREST_PARAMS = {
    "n_estimators": 200,
    "max_depth": 10,            # Constrained to prevent overfit
    "min_samples_leaf": 5,      # Smooths decision boundaries
    "min_samples_split": 10,    # Requires more samples to split
    "max_features": "sqrt",     # Feature subsampling
    "class_weight": "balanced",
    "random_state": RANDOM_STATE,
    "n_jobs": -1,
}

XGBOOST_PARAMS = {
    "n_estimators": 300,
    "max_depth": 5,             # Constrained
    "learning_rate": 0.05,      # Low LR + more trees = better generalization
    "subsample": 0.8,           # Row subsampling
    "colsample_bytree": 0.8,    # Column subsampling
    "gamma": 1.0,               # Pruning threshold
    "reg_alpha": 0.5,           # L1 regularization
    "reg_lambda": 1.5,          # L2 regularization
    "min_child_weight": 5,
    "eval_metric": "auc",
    "random_state": RANDOM_STATE,
    "n_jobs": -1,
    "verbosity": 0,
}

LIGHTGBM_PARAMS = {
    "n_estimators": 300,
    "max_depth": 7,
    "num_leaves": 31,           # < 2^max_depth to prevent overfit
    "learning_rate": 0.05,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "min_child_samples": 20,
    "reg_alpha": 0.3,           # L1
    "reg_lambda": 0.3,          # L2
    "metric": "auc",
    "random_state": RANDOM_STATE,
    "n_jobs": -1,
    "verbosity": -1,
}

CATBOOST_PARAMS = {
    "iterations": 300,
    "depth": 6,
    "learning_rate": 0.05,
    "l2_leaf_reg": 5,
    "border_count": 64,
    "eval_metric": "AUC",
    "auto_class_weights": "Balanced",
    "random_seed": RANDOM_STATE,
    "verbose": 0,
}

# ─── Early Stopping Configuration ───────────────────────────────────────────
EARLY_STOPPING_ROUNDS = 100
MLP_VALIDATION_FRACTION = 0.1
MLP_N_ITER_NO_CHANGE = 100

# ─── Scaler Comparison ──────────────────────────────────────────────────────
SCALER_NAMES = {
    "standard": "StandardScaler",
    "robust": "RobustScaler",
    "power": "PowerTransformer",
}

# ─── Scale Pipeline Models (require normalization) ────────────────────────────
SVM_PARAMS = {
    "C": 1.0,
    "kernel": "rbf",
    "class_weight": "balanced",
    "probability": True,
    "random_state": RANDOM_STATE,
}

KNN_PARAMS = {
    "n_neighbors": 15,
    "weights": "distance",
    "n_jobs": -1,
}

MLP_CLASSIFIER_PARAMS = {
    "hidden_layer_sizes": (128, 64, 32),
    "activation": "relu",
    "solver": "adam",
    "alpha": 0.001,
    "batch_size": 64,
    "learning_rate": "adaptive",
    "max_iter": 500,
    "early_stopping": True,
    "validation_fraction": MLP_VALIDATION_FRACTION,
    "n_iter_no_change": MLP_N_ITER_NO_CHANGE,
    "random_state": RANDOM_STATE,
}

# ─── Tree Pipeline Models (no scaling) ──────────────────────────────────────
DECISION_TREE_PARAMS = {
    "max_depth": 10,
    "min_samples_leaf": 5,
    "min_samples_split": 10,
    "class_weight": "balanced",
    "random_state": RANDOM_STATE,
}

EXTRA_TREES_PARAMS = {
    "n_estimators": 200,
    "max_depth": 10,
    "min_samples_leaf": 5,
    "min_samples_split": 10,
    "max_features": "sqrt",
    "class_weight": "balanced",
    "random_state": RANDOM_STATE,
    "n_jobs": -1,
}

# ─── Tuning Search Spaces ───────────────────────────────────────────────────
TUNING_N_ITER = 20  # Number of RandomizedSearchCV iterations
TUNING_SCORING = "recall"  # Optimize for recall in churn detection

# ─── Monitoring Thresholds ───────────────────────────────────────────────────
PSI_STABLE = 0.1
PSI_DRIFT = 0.2

# ─── Risk Segments ──────────────────────────────────────────────────────────
RISK_THRESHOLDS = {
    "low": (0.0, 0.3),
    "medium": (0.3, 0.5),
    "high": (0.5, 0.7),
    "critical": (0.7, 1.0),
}

RISK_RECOMMENDATIONS = {
    "low": "No immediate action needed",
    "medium": "Monitor + satisfaction survey",
    "high": "Retention call + personalised offer",
    "critical": "Urgent escalation + premium retention package",
}
