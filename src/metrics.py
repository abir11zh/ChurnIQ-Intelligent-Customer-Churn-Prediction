"""
Unified Metrics Module — Evaluation with Timing
================================================
Single source for metric computation, cross-validation, and timing benchmarks.
"""
from __future__ import annotations

import logging
import time
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    confusion_matrix,
    f1_score,
    make_scorer,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import StratifiedKFold, cross_validate

from src.config import CV_FOLDS, CV_SHUFFLE, RANDOM_STATE

logger = logging.getLogger("churn_pipeline")


def compute_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_proba: np.ndarray,
) -> Dict[str, float]:
    """Compute all classification metrics for a single evaluation."""
    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred)),
        "f1": float(f1_score(y_true, y_pred)),
        "roc_auc": float(roc_auc_score(y_true, y_proba)),
        "pr_auc": float(average_precision_score(y_true, y_proba)),
    }


def evaluate_with_timing(
    model: Any,
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    model_name: str,
    scaler: str = "none",
    threshold: float = 0.5,
    cv_folds: int = CV_FOLDS,
) -> Dict[str, Any]:
    """
    Fit model, evaluate on test set, run CV, and measure train/inference time.
    Returns a flat dict suitable for benchmark CSV export.
    """
    y_train_arr = np.asarray(y_train)
    y_test_arr = np.asarray(y_test)

    # Training time
    t0 = time.perf_counter()
    try:
        model.fit(X_train, y_train)
    except RuntimeError:
        logger.warning(f"{model_name}: parallel fit failed, retrying sequential")
        if hasattr(model, "set_params"):
            model.set_params(n_jobs=1)
        model.fit(X_train, y_train)
    training_time = time.perf_counter() - t0

    # Inference time (100 predictions averaged)
    t1 = time.perf_counter()
    for _ in range(5):
        _ = model.predict_proba(X_test)
    inference_time = (time.perf_counter() - t1) / 5

    y_train_proba = model.predict_proba(X_train)[:, 1]
    y_test_proba = model.predict_proba(X_test)[:, 1]
    y_test_pred = (y_test_proba >= threshold).astype(int)
    y_train_pred = (y_train_proba >= threshold).astype(int)

    test_metrics = compute_metrics(y_test_arr, y_test_pred, y_test_proba)
    train_auc = float(roc_auc_score(y_train_arr, y_train_proba))
    train_recall = float(recall_score(y_train_arr, y_train_pred))

    # Cross-validation
    cv_mean, cv_std = run_cv_roc_auc(model, X_train, y_train, cv_folds=cv_folds)

    tn, fp, fn, tp = confusion_matrix(y_test_arr, y_test_pred).ravel()
    auc_gap = train_auc - test_metrics["roc_auc"]
    recall_gap = train_recall - test_metrics["recall"]

    return {
        "model": model_name,
        "scaler": scaler,
        "accuracy": test_metrics["accuracy"],
        "precision": test_metrics["precision"],
        "recall": test_metrics["recall"],
        "f1": test_metrics["f1"],
        "roc_auc": test_metrics["roc_auc"],
        "pr_auc": test_metrics["pr_auc"],
        "cv_mean": cv_mean,
        "cv_std": cv_std,
        "training_time": round(training_time, 4),
        "inference_time": round(inference_time, 6),
        "train_auc_roc": train_auc,
        "train_recall": train_recall,
        "auc_gap": round(auc_gap, 4),
        "recall_gap": round(recall_gap, 4),
        "tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp),
        "fitted_model": model,
        "y_test_proba": y_test_proba,
        "y_train_proba": y_train_proba,
    }


def run_cv_roc_auc(
    model: Any,
    X: pd.DataFrame,
    y: pd.Series,
    cv_folds: int = CV_FOLDS,
) -> tuple[float, float]:
    """Run stratified K-fold CV and return mean/std ROC-AUC."""
    scoring = {
        "roc_auc": "roc_auc",
        "pr_auc": make_scorer(average_precision_score, response_method="predict_proba"),
    }
    skf = StratifiedKFold(n_splits=cv_folds, shuffle=CV_SHUFFLE, random_state=RANDOM_STATE)

    try:
        cv_res = cross_validate(model, X, y, cv=skf, scoring=scoring, n_jobs=-1)
    except (RuntimeError, ValueError):
        cv_res = cross_validate(model, X, y, cv=skf, scoring=scoring, n_jobs=1)

    return float(cv_res["test_roc_auc"].mean()), float(cv_res["test_roc_auc"].std())


def evaluate_prefitted(
    model: Any,
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    model_name: str,
    scaler: str = "none",
    threshold: float = 0.5,
    training_time: float = 0.0,
) -> Dict[str, Any]:
    """Evaluate an already-fitted model without re-fitting (for early-stopped trees)."""
    y_train_arr = np.asarray(y_train)
    y_test_arr = np.asarray(y_test)

    t1 = time.perf_counter()
    for _ in range(5):
        _ = model.predict_proba(X_test)
    inference_time = (time.perf_counter() - t1) / 5

    y_train_proba = model.predict_proba(X_train)[:, 1]
    y_test_proba = model.predict_proba(X_test)[:, 1]
    y_test_pred = (y_test_proba >= threshold).astype(int)
    y_train_pred = (y_train_proba >= threshold).astype(int)

    test_metrics = compute_metrics(y_test_arr, y_test_pred, y_test_proba)
    train_auc = float(roc_auc_score(y_train_arr, y_train_proba))
    train_recall = float(recall_score(y_train_arr, y_train_pred))

    cv_mean, cv_std = run_cv_roc_auc(model, X_train, y_train)
    tn, fp, fn, tp = confusion_matrix(y_test_arr, y_test_pred).ravel()

    return {
        "model": model_name,
        "scaler": scaler,
        "accuracy": test_metrics["accuracy"],
        "precision": test_metrics["precision"],
        "recall": test_metrics["recall"],
        "f1": test_metrics["f1"],
        "roc_auc": test_metrics["roc_auc"],
        "pr_auc": test_metrics["pr_auc"],
        "cv_mean": cv_mean,
        "cv_std": cv_std,
        "training_time": round(training_time, 4),
        "inference_time": round(inference_time, 6),
        "train_auc_roc": train_auc,
        "train_recall": train_recall,
        "auc_gap": round(train_auc - test_metrics["roc_auc"], 4),
        "recall_gap": round(train_recall - test_metrics["recall"], 4),
        "tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp),
        "fitted_model": model,
        "y_test_proba": y_test_proba,
        "y_train_proba": y_train_proba,
    }


def results_to_dataframe(results: List[Dict[str, Any]]) -> pd.DataFrame:
    """Convert list of result dicts to a clean benchmark DataFrame."""
    cols = [
        "model", "scaler", "accuracy", "precision", "recall", "f1",
        "roc_auc", "pr_auc", "cv_mean", "cv_std",
        "training_time", "inference_time",
    ]
    rows = []
    for r in results:
        rows.append({c: r.get(c) for c in cols})
    df = pd.DataFrame(rows)
    return df.sort_values("roc_auc", ascending=False).reset_index(drop=True)
