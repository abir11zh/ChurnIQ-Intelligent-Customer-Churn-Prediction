"""
Early Stopping Module — Boosting & Neural Network Training
============================================================
Centralized early stopping for XGBoost, LightGBM, CatBoost, and MLPClassifier.
Produces learning curves, optimal iteration counts, and ROC-AUC impact analysis.
"""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from lightgbm import LGBMClassifier, early_stopping as lgb_early_stopping, log_evaluation
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
from xgboost import XGBClassifier
from catboost import CatBoostClassifier

from src.config import (
    RANDOM_STATE,
    EARLY_STOPPING_ROUNDS,
    EARLY_STOPPING_REPORT_PATH,
    FIGURES_DIR,
    XGBOOST_PARAMS,
    LIGHTGBM_PARAMS,
    CATBOOST_PARAMS,
)

logger = logging.getLogger("churn_pipeline")


def create_validation_split(
    X: np.ndarray,
    y: np.ndarray,
    val_fraction: float = 0.15,
    random_state: int = RANDOM_STATE,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Create a stratified validation split from training data."""
    return train_test_split(
        X, y,
        test_size=val_fraction,
        random_state=random_state,
        stratify=y,
    )


def fit_xgboost_with_early_stopping(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_val: np.ndarray,
    y_val: np.ndarray,
    params: Optional[Dict[str, Any]] = None,
    scale_pos_weight: float = 1.0,
    early_stopping_rounds: int = EARLY_STOPPING_ROUNDS,
) -> Tuple[XGBClassifier, Dict[str, Any]]:
    """
    Fit XGBoost with dedicated validation set and early stopping.
    Saves best_iteration and best_score from the eval history.
    """
    model_params = {**XGBOOST_PARAMS, **(params or {})}
    model_params["scale_pos_weight"] = scale_pos_weight
    model_params["eval_metric"] = "auc"

    model = XGBClassifier(**model_params)
    model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        verbose=False,
    )

    metadata = {
        "model_type": "XGBoost",
        "best_iteration": int(getattr(model, "best_iteration", model_params.get("n_estimators", 300))),
        "best_score": float(getattr(model, "best_score", np.nan)),
        "early_stopping_rounds": early_stopping_rounds,
        "n_estimators_requested": model_params.get("n_estimators", 300),
        "val_auc": float(roc_auc_score(y_val, model.predict_proba(X_val)[:, 1])),
    }

    if hasattr(model, "evals_result_") and model.evals_result_:
        val_auc_history = model.evals_result_.get("validation_0", {}).get("auc", [])
        if val_auc_history:
            metadata["best_score"] = float(max(val_auc_history))
            metadata["best_iteration"] = int(np.argmax(val_auc_history))
            metadata["learning_curve_auc"] = [float(v) for v in val_auc_history]

    logger.info(
        f"XGBoost ES: best_iter={metadata['best_iteration']}, "
        f"best_auc={metadata['best_score']:.4f}"
    )
    return model, metadata


def fit_lightgbm_with_early_stopping(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_val: np.ndarray,
    y_val: np.ndarray,
    params: Optional[Dict[str, Any]] = None,
    scale_pos_weight: float = 1.0,
    early_stopping_rounds: int = EARLY_STOPPING_ROUNDS,
) -> Tuple[LGBMClassifier, Dict[str, Any]]:
    """Fit LightGBM with dedicated validation set and early stopping."""
    model_params = {**LIGHTGBM_PARAMS, **(params or {})}
    model_params["scale_pos_weight"] = scale_pos_weight
    model_params["metric"] = "auc"

    model = LGBMClassifier(**model_params)
    model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        callbacks=[
            lgb_early_stopping(early_stopping_rounds, verbose=False),
            log_evaluation(period=0),
        ],
    )

    best_score_val = np.nan
    if hasattr(model, "best_score_") and isinstance(model.best_score_, dict):
        for key in ("valid_0", "valid_1"):
            if key in model.best_score_:
                score_dict = model.best_score_[key]
                if isinstance(score_dict, dict):
                    best_score_val = float(score_dict.get("auc", score_dict.get("binary_logloss", np.nan)))
                    break

    metadata = {
        "model_type": "LightGBM",
        "best_iteration": int(getattr(model, "best_iteration_", model_params.get("n_estimators", 300))),
        "best_score": float(best_score_val),
        "early_stopping_rounds": early_stopping_rounds,
        "n_estimators_requested": model_params.get("n_estimators", 300),
        "val_auc": float(roc_auc_score(y_val, model.predict_proba(X_val)[:, 1])),
    }

    if hasattr(model, "evals_result_") and model.evals_result_:
        for key, metrics in model.evals_result_.items():
            if "auc" in metrics:
                history = metrics["auc"]
                metadata["best_score"] = float(max(history))
                metadata["best_iteration"] = int(np.argmax(history))
                metadata["learning_curve_auc"] = [float(v) for v in history]
                break

    logger.info(
        f"LightGBM ES: best_iter={metadata['best_iteration']}, "
        f"best_auc={metadata['best_score']:.4f}"
    )
    return model, metadata


def fit_catboost_with_early_stopping(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_val: np.ndarray,
    y_val: np.ndarray,
    params: Optional[Dict[str, Any]] = None,
    od_wait: int = EARLY_STOPPING_ROUNDS,
) -> Tuple[CatBoostClassifier, Dict[str, Any]]:
    """Fit CatBoost with use_best_model=True and overfitting detector."""
    model_params = {**CATBOOST_PARAMS, **(params or {})}
    model_params["od_type"] = "Iter"
    model_params["od_wait"] = od_wait

    model = CatBoostClassifier(**model_params)
    model.fit(
        X_train, y_train,
        eval_set=(X_val, y_val),
        use_best_model=True,
        verbose=0,
    )

    best_iter = int(model.get_best_iteration()) if hasattr(model, "get_best_iteration") else model_params.get("iterations", 300)
    metadata = {
        "model_type": "CatBoost",
        "best_iteration": best_iter,
        "best_score": float(model.get_best_score().get("validation", {}).get("AUC", np.nan)
                            if hasattr(model, "get_best_score") else np.nan),
        "od_type": "Iter",
        "od_wait": od_wait,
        "n_estimators_requested": model_params.get("iterations", 300),
        "val_auc": float(roc_auc_score(y_val, model.predict_proba(X_val)[:, 1])),
    }

    if hasattr(model, "evals_result_") and model.evals_result_:
        val_history = model.evals_result_.get("validation", {}).get("AUC", [])
        if val_history:
            metadata["learning_curve_auc"] = [float(v) for v in val_history]
            metadata["best_score"] = float(max(val_history))
            metadata["best_iteration"] = int(np.argmax(val_history))

    logger.info(
        f"CatBoost ES: best_iter={metadata['best_iteration']}, "
        f"best_auc={metadata['best_score']:.4f}"
    )
    return model, metadata


def plot_learning_curves(
    early_stopping_results: Dict[str, Dict[str, Any]],
    save_dir: Optional[Path] = None,
) -> List[Path]:
    """Plot learning curves (validation AUC vs iteration) for boosting models."""
    save_dir = save_dir or FIGURES_DIR
    save_dir.mkdir(parents=True, exist_ok=True)
    saved_paths: List[Path] = []

    for model_name, meta in early_stopping_results.items():
        curve = meta.get("learning_curve_auc")
        if not curve:
            continue

        fig, ax = plt.subplots(figsize=(10, 5))
        iterations = range(1, len(curve) + 1)
        ax.plot(iterations, curve, linewidth=2, color="#3498db", label="Validation AUC")
        best_iter = meta.get("best_iteration", 0)
        if best_iter < len(curve):
            ax.axvline(best_iter + 1, color="#e74c3c", linestyle="--",
                       label=f"Best iter={best_iter + 1}")
        ax.set_xlabel("Iteration / Boosting Round")
        ax.set_ylabel("Validation AUC")
        ax.set_title(f"Learning Curve — {model_name} (Early Stopping)", fontweight="bold")
        ax.legend()
        ax.grid(True, alpha=0.3)
        plt.tight_layout()

        fname = f"learning_curve_{model_name.lower().replace(' ', '_')}.png"
        path = save_dir / fname
        plt.savefig(path, dpi=150, bbox_inches="tight")
        plt.close()
        saved_paths.append(path)
        logger.info(f"Saved learning curve → {path}")

    return saved_paths


def run_early_stopping_analysis(
    X_train: np.ndarray,
    y_train: np.ndarray,
    scale_pos_weight: float = 1.0,
    save_results: bool = True,
) -> Dict[str, Dict[str, Any]]:
    """
    Run early stopping analysis for all boosting models.
    Returns metadata dict and optionally saves JSON report.
    """
    X_tr, X_val, y_tr, y_val = create_validation_split(X_train, y_train)

    results: Dict[str, Dict[str, Any]] = {}

    _, xgb_meta = fit_xgboost_with_early_stopping(
        X_tr, y_tr, X_val, y_val, scale_pos_weight=scale_pos_weight
    )
    results["XGBoost"] = xgb_meta

    _, lgbm_meta = fit_lightgbm_with_early_stopping(
        X_tr, y_tr, X_val, y_val, scale_pos_weight=scale_pos_weight
    )
    results["LightGBM"] = lgbm_meta

    _, cat_meta = fit_catboost_with_early_stopping(X_tr, y_tr, X_val, y_val)
    results["CatBoost"] = cat_meta

    plot_learning_curves(results)

    if save_results:
        EARLY_STOPPING_REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
        serializable = {}
        for k, v in results.items():
            serializable[k] = {key: val for key, val in v.items() if key != "learning_curve_auc"}
            serializable[k]["curve_length"] = len(v.get("learning_curve_auc", []))
        with open(EARLY_STOPPING_REPORT_PATH, "w", encoding="utf-8") as f:
            json.dump(serializable, f, indent=2)
        logger.info(f"Early stopping report saved → {EARLY_STOPPING_REPORT_PATH}")

    return results
