"""
Evaluation Module — Metrics, Plots, Comparison
"""
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import seaborn as sns
from sklearn.metrics import (
    confusion_matrix, classification_report,
    roc_curve, precision_recall_curve,
    roc_auc_score, f1_score, recall_score, precision_score,
    average_precision_score, brier_score_loss
)
from sklearn.calibration import calibration_curve
import logging

from src.config import COST_FALSE_NEGATIVE, COST_FALSE_POSITIVE, REPORTS_DIR

logger = logging.getLogger("churn_pipeline")
sns.set_theme(style="whitegrid", font_scale=1.1)


def plot_model_evaluation(model, X_train, y_train, X_test, y_test, name, threshold=0.5):
    """Full visual evaluation: confusion matrix, ROC, PR curve."""
    y_train_proba = model.predict_proba(X_train)[:, 1]
    y_test_proba = model.predict_proba(X_test)[:, 1]
    y_test_pred = (y_test_proba >= threshold).astype(int)
    
    cm = confusion_matrix(y_test, y_test_pred)
    
    fig, axes = plt.subplots(1, 3, figsize=(18, 5))
    
    # 1. Confusion Matrix
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", ax=axes[0],
                xticklabels=["No Churn", "Churn"],
                yticklabels=["No Churn", "Churn"])
    axes[0].set_title(f"Confusion Matrix (t={threshold:.2f})", fontweight="bold")
    axes[0].set_xlabel("Predicted"); axes[0].set_ylabel("Actual")
    
    # 2. ROC Curve
    fpr_tr, tpr_tr, _ = roc_curve(y_train, y_train_proba)
    fpr_te, tpr_te, _ = roc_curve(y_test, y_test_proba)
    auc_tr = roc_auc_score(y_train, y_train_proba)
    auc_te = roc_auc_score(y_test, y_test_proba)
    axes[1].plot(fpr_tr, tpr_tr, label=f"Train AUC={auc_tr:.3f}", linestyle="--")
    axes[1].plot(fpr_te, tpr_te, label=f"Test  AUC={auc_te:.3f}", linewidth=2)
    axes[1].plot([0, 1], [0, 1], "k--", alpha=0.3, label="Random")
    axes[1].set_xlabel("FPR"); axes[1].set_ylabel("TPR")
    axes[1].set_title("ROC Curve", fontweight="bold")
    axes[1].legend()
    
    # 3. PR Curve
    prec, rec, _ = precision_recall_curve(y_test, y_test_proba)
    pr_auc = average_precision_score(y_test, y_test_proba)
    axes[2].plot(rec, prec, linewidth=2, color="darkorange")
    axes[2].axhline(y_test.mean(), linestyle="--", color="gray", label=f"Baseline={y_test.mean():.3f}")
    axes[2].set_xlabel("Recall"); axes[2].set_ylabel("Precision")
    axes[2].set_title(f"PR Curve (AUC={pr_auc:.3f})", fontweight="bold")
    axes[2].legend()
    
    plt.suptitle(name, fontsize=14, fontweight="bold", y=1.02)
    plt.tight_layout()
    plt.savefig(REPORTS_DIR / f"{name.replace(' ', '_').lower()}_eval.png", dpi=150, bbox_inches="tight")
    plt.show()


def plot_threshold_analysis(thresh_df, best_f1_t, best_cost_t):
    """Plot threshold vs metrics and threshold vs business cost."""
    fig, axes = plt.subplots(1, 2, figsize=(16, 6))
    
    axes[0].plot(thresh_df["threshold"], thresh_df["recall"], label="Recall", color="#e74c3c", linewidth=2)
    axes[0].plot(thresh_df["threshold"], thresh_df["precision"], label="Precision", color="#3498db", linewidth=2)
    axes[0].plot(thresh_df["threshold"], thresh_df["f1"], label="F1", color="#2ecc71", linewidth=2, linestyle="--")
    axes[0].axvline(0.5, color="black", linestyle=":", alpha=0.5, label="Default (0.5)")
    axes[0].axvline(best_f1_t, color="green", linestyle="--", alpha=0.8, label=f"Best F1 (t={best_f1_t:.2f})")
    axes[0].set_xlabel("Threshold"); axes[0].set_ylabel("Score")
    axes[0].set_title("Metrics vs Threshold", fontweight="bold")
    axes[0].legend(); axes[0].grid(True, alpha=0.3)
    
    axes[1].plot(thresh_df["threshold"], thresh_df["cost"], color="purple", linewidth=2, label="Total Cost")
    axes[1].axvline(best_cost_t, color="purple", linestyle=":", label=f"Min cost (t={best_cost_t:.2f})")
    axes[1].axvline(0.5, color="black", linestyle=":", alpha=0.5, label="Default (0.5)")
    axes[1].set_xlabel("Threshold"); axes[1].set_ylabel("Business Cost ($)")
    axes[1].set_title(f"Business Cost vs Threshold\n(FN=${COST_FALSE_NEGATIVE}, FP=${COST_FALSE_POSITIVE})", fontweight="bold")
    axes[1].legend(fontsize=9); axes[1].grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(REPORTS_DIR / "threshold_analysis.png", dpi=150, bbox_inches="tight")
    plt.show()


def plot_final_comparison(results_df):
    """Plot comprehensive model comparison."""
    metrics_to_plot = ["test_recall", "test_f1", "test_auc_roc", "test_pr_auc"]
    titles = ["Test Recall", "Test F1", "Test AUC-ROC", "Test PR-AUC"]
    
    fig, axes = plt.subplots(2, 2, figsize=(20, 14))
    axes = axes.flatten()
    
    for i, (metric, title) in enumerate(zip(metrics_to_plot, titles)):
        if metric not in results_df.columns:
            continue
        sub = results_df.sort_values(metric, ascending=False)
        colors = ["#e74c3c" if j == 0 else "#3498db" for j in range(len(sub))]
        bars = axes[i].barh(sub["model"], sub[metric], color=colors, edgecolor="white")
        for bar, val in zip(bars, sub[metric]):
            axes[i].text(bar.get_width() - 0.01, bar.get_y() + bar.get_height()/2,
                         f"{val:.3f}", va="center", ha="right",
                         fontweight="bold", color="white", fontsize=9)
        axes[i].set_title(title, fontweight="bold", fontsize=13)
        axes[i].set_xlim(0.3, 1.0)
        axes[i].grid(True, alpha=0.3, axis="x")
    
    plt.suptitle("Complete Model Comparison", fontsize=16, fontweight="bold", y=1.01)
    plt.tight_layout()
    plt.savefig(REPORTS_DIR / "model_comparison.png", dpi=150, bbox_inches="tight")
    plt.show()


def plot_business_impact(results_df):
    """Plot business cost and CLV saved per model."""
    fig, ax = plt.subplots(figsize=(12, 7))
    sub = results_df.sort_values("business_cost")
    colors = ["#2ecc71" if i == 0 else "#95a5a6" for i in range(len(sub))]
    bars = ax.barh(sub["model"], sub["business_cost"], color=colors, edgecolor="white")
    for bar, val in zip(bars, sub["business_cost"]):
        ax.text(bar.get_width() + 100, bar.get_y() + bar.get_height()/2,
                f"${val:,.0f}", va="center", fontweight="bold", fontsize=9)
    ax.set_xlabel("Total Business Cost ($)")
    ax.set_title("Business Cost per Model (Lower = Better)", fontweight="bold")
    plt.tight_layout()
    plt.savefig(REPORTS_DIR / "business_cost.png", dpi=150, bbox_inches="tight")
    plt.show()


def print_final_report(results_df, cv_summary=None):
    """Print formatted final comparison table."""
    cols = ["model", "test_recall", "test_precision", "test_f1",
            "test_auc_roc", "test_pr_auc", "brier_score",
            "business_cost", "overfit_status"]
    available = [c for c in cols if c in results_df.columns]
    report = results_df[available].sort_values("test_recall", ascending=False)
    
    print("\n" + "=" * 100)
    print("  FINAL MODEL COMPARISON REPORT")
    print("=" * 100)
    print(report.to_string(index=False))
    print("=" * 100)
