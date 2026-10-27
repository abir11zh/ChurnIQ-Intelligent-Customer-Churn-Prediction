"""
Academic Visualization Module
===============================
Generates all figures for reports/figures/ directory.
"""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.metrics import (
    auc,
    confusion_matrix,
    precision_recall_curve,
    roc_curve,
    roc_auc_score,
)

from src.config import FIGURES_DIR

logger = logging.getLogger("churn_pipeline")
sns.set_theme(style="whitegrid", font_scale=1.0)


def _save_fig(fig: plt.Figure, name: str) -> Path:
    FIGURES_DIR.mkdir(parents=True, exist_ok=True)
    path = FIGURES_DIR / name
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    logger.info(f"Figure saved → {path}")
    return path


def plot_roc_curves(
    models_data: Dict[str, Dict[str, Any]],
    y_test: np.ndarray,
    top_n: int = 8,
) -> Path:
    """ROC curves for top-N models by AUC."""
    fig, ax = plt.subplots(figsize=(10, 8))
    sorted_models = sorted(
        models_data.items(),
        key=lambda x: roc_auc_score(y_test, x[1]["y_proba"]),
        reverse=True,
    )[:top_n]

    for name, data in sorted_models:
        fpr, tpr, _ = roc_curve(y_test, data["y_proba"])
        auc_val = auc(fpr, tpr)
        ax.plot(fpr, tpr, linewidth=2, label=f"{name} (AUC={auc_val:.3f})")

    ax.plot([0, 1], [0, 1], "k--", alpha=0.4, label="Random")
    ax.set_xlabel("False Positive Rate")
    ax.set_ylabel("True Positive Rate")
    ax.set_title("ROC Curves — Top Models", fontweight="bold")
    ax.legend(fontsize=8, loc="lower right")
    ax.grid(True, alpha=0.3)
    return _save_fig(fig, "roc_curves.png")


def plot_pr_curves(
    models_data: Dict[str, Dict[str, Any]],
    y_test: np.ndarray,
    top_n: int = 8,
) -> Path:
    """Precision-Recall curves for top-N models."""
    fig, ax = plt.subplots(figsize=(10, 8))
    baseline = y_test.mean()

    sorted_models = sorted(
        models_data.items(),
        key=lambda x: roc_auc_score(y_test, x[1]["y_proba"]),
        reverse=True,
    )[:top_n]

    for name, data in sorted_models:
        prec, rec, _ = precision_recall_curve(y_test, data["y_proba"])
        ax.plot(rec, prec, linewidth=2, label=name)

    ax.axhline(baseline, linestyle="--", color="gray", alpha=0.6, label=f"Baseline={baseline:.3f}")
    ax.set_xlabel("Recall")
    ax.set_ylabel("Precision")
    ax.set_title("Precision-Recall Curves — Top Models", fontweight="bold")
    ax.legend(fontsize=8)
    ax.grid(True, alpha=0.3)
    return _save_fig(fig, "pr_curves.png")


def plot_confusion_matrices(
    models_data: Dict[str, Dict[str, Any]],
    y_test: np.ndarray,
    threshold: float = 0.5,
    top_n: int = 4,
) -> Path:
    """Confusion matrices for top models in a grid."""
    sorted_models = sorted(
        models_data.items(),
        key=lambda x: roc_auc_score(y_test, x[1]["y_proba"]),
        reverse=True,
    )[:top_n]

    n = len(sorted_models)
    fig, axes = plt.subplots(1, n, figsize=(5 * n, 4))
    if n == 1:
        axes = [axes]

    for ax, (name, data) in zip(axes, sorted_models):
        y_pred = (data["y_proba"] >= threshold).astype(int)
        cm = confusion_matrix(y_test, y_pred)
        sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", ax=ax,
                    xticklabels=["No", "Yes"], yticklabels=["No", "Yes"])
        ax.set_title(name, fontsize=9, fontweight="bold")
        ax.set_xlabel("Predicted")
        ax.set_ylabel("Actual")

    fig.suptitle("Confusion Matrices", fontweight="bold", y=1.02)
    plt.tight_layout()
    return _save_fig(fig, "confusion_matrices.png")


def plot_feature_importance(
    model: Any,
    feature_names: List[str],
    model_name: str = "Best Tree Model",
    top_n: int = 20,
) -> Optional[Path]:
    """Bar plot of feature importances for tree-based models."""
    importances = None
    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
    elif hasattr(model, "named_steps"):
        clf = model.named_steps.get("clf")
        if clf is not None and hasattr(clf, "feature_importances_"):
            importances = clf.feature_importances_

    if importances is None or len(importances) == 0:
        logger.warning("No feature importances available")
        return None

    if len(feature_names) != len(importances):
        feature_names = [f"feat_{i}" for i in range(len(importances))]

    idx = np.argsort(importances)[::-1][:top_n]
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.barh(
        [feature_names[i] for i in idx[::-1]],
        importances[idx[::-1]],
        color="#3498db",
        edgecolor="white",
    )
    ax.set_xlabel("Importance")
    ax.set_title(f"Feature Importance — {model_name}", fontweight="bold")
    plt.tight_layout()
    return _save_fig(fig, "feature_importance.png")


def plot_scaler_comparison(scaler_df: pd.DataFrame) -> Path:
    """Grouped bar chart comparing scalers across models."""
    fig, ax = plt.subplots(figsize=(14, 7))
    pivot = scaler_df.pivot_table(index="model", columns="scaler", values="roc_auc")
    pivot.plot(kind="bar", ax=ax, width=0.8, edgecolor="white")
    ax.set_ylabel("ROC-AUC")
    ax.set_title("Scaler Comparison — ROC-AUC by Model", fontweight="bold")
    ax.set_xticklabels(ax.get_xticklabels(), rotation=35, ha="right")
    ax.legend(title="Scaler")
    ax.grid(True, alpha=0.3, axis="y")
    plt.tight_layout()
    return _save_fig(fig, "scaler_comparison.png")


def plot_training_time_comparison(benchmark_df: pd.DataFrame) -> Path:
    """Horizontal bar chart of training times."""
    fig, ax = plt.subplots(figsize=(12, 8))
    sub = benchmark_df.sort_values("training_time", ascending=True).tail(15)
    colors = ["#e74c3c" if t > sub["training_time"].median() else "#3498db"
              for t in sub["training_time"]]
    ax.barh(sub["model"] + " (" + sub["scaler"] + ")", sub["training_time"],
            color=colors, edgecolor="white")
    ax.set_xlabel("Training Time (seconds)")
    ax.set_title("Training Time Comparison", fontweight="bold")
    ax.grid(True, alpha=0.3, axis="x")
    plt.tight_layout()
    return _save_fig(fig, "training_time_comparison.png")


def plot_roc_auc_comparison(benchmark_df: pd.DataFrame) -> Path:
    """Horizontal bar chart of ROC-AUC scores."""
    fig, ax = plt.subplots(figsize=(12, 8))
    sub = benchmark_df.head(15)
    colors = ["#2ecc71" if i == 0 else "#3498db" for i in range(len(sub))]
    labels = sub["model"] + " (" + sub["scaler"] + ")"
    ax.barh(labels, sub["roc_auc"], color=colors, edgecolor="white")
    for i, v in enumerate(sub["roc_auc"]):
        ax.text(v - 0.005, i, f"{v:.4f}", va="center", ha="right",
                fontweight="bold", color="white", fontsize=8)
    ax.set_xlabel("ROC-AUC")
    ax.set_title("ROC-AUC Comparison — Global Benchmark", fontweight="bold")
    ax.set_xlim(0.5, 1.0)
    ax.grid(True, alpha=0.3, axis="x")
    plt.tight_layout()
    return _save_fig(fig, "roc_auc_comparison.png")


def generate_all_figures(
    benchmark_results: Dict[str, Any],
    run_shap: bool = True,
) -> List[Path]:
    """Generate all academic figures and optionally SHAP plots."""
    saved: List[Path] = []
    benchmark_df = benchmark_results["benchmark_df"]
    scaler_df = benchmark_results["scaler_df"]
    y_test = benchmark_results["y_test"].values
    fitted_models = benchmark_results.get("fitted_models", {})
    X_train = benchmark_results["X_train"]
    X_test = benchmark_results["X_test"]

    # Build models_data for ROC/PR/CM plots
    models_data: Dict[str, Dict[str, Any]] = {}
    for name, model in fitted_models.items():
        try:
            proba = model.predict_proba(X_test)[:, 1]
            models_data[name] = {"y_proba": proba, "model": model}
        except Exception as exc:
            logger.warning(f"Could not get proba for {name}: {exc}")

    if models_data:
        saved.append(plot_roc_curves(models_data, y_test))
        saved.append(plot_pr_curves(models_data, y_test))
        saved.append(plot_confusion_matrices(models_data, y_test))

    saved.append(plot_scaler_comparison(scaler_df))
    saved.append(plot_training_time_comparison(benchmark_df))
    saved.append(plot_roc_auc_comparison(benchmark_df))

    # Feature importance on best tree model
    tree_models = [n for n in fitted_models if "Scaler" not in n and "Stacking" not in n]
    if tree_models:
        best_tree = max(
            tree_models,
            key=lambda n: roc_auc_score(y_test, fitted_models[n].predict_proba(X_test)[:, 1]),
        )
        try:
            pre = fitted_models[best_tree].named_steps["pre"]
            pre.fit(X_train)
            feat_names = list(pre.get_feature_names_out())
            path = plot_feature_importance(fitted_models[best_tree], feat_names, best_tree)
            if path:
                saved.append(path)
        except Exception as exc:
            logger.warning(f"Feature importance plot failed: {exc}")

    # SHAP
    if run_shap and tree_models:
        try:
            from src.overfitting_shap import run_shap_analysis
            best_shap = tree_models[0]
            for n in tree_models:
                auc_n = roc_auc_score(y_test, fitted_models[n].predict_proba(X_test)[:, 1])
                if auc_n > roc_auc_score(y_test, fitted_models[best_shap].predict_proba(X_test)[:, 1]):
                    best_shap = n
            run_shap_analysis(
                fitted_models[best_shap], X_train, X_test,
                model_name=best_shap,
            )
            # Copy SHAP plots to figures dir
            from src.config import REPORTS_DIR
            for shap_name in ["shap_summary_plot.png", "shap_bar_plot.png"]:
                src = REPORTS_DIR / shap_name
                if src.exists():
                    import shutil
                    dst = FIGURES_DIR / shap_name
                    FIGURES_DIR.mkdir(parents=True, exist_ok=True)
                    shutil.copy(src, dst)
                    saved.append(dst)
        except Exception as exc:
            logger.warning(f"SHAP generation failed: {exc}")

    return saved
