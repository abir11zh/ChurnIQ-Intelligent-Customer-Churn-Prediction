"""
Overfitting Detection & SHAP Explainability Module
====================================================
Generates per-model overfitting reports, Train/Val/Test gap analysis,
SHAP Summary Plot, Bar Plot, and Top-20 feature importance.
"""
import os
import warnings
import logging
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import seaborn as sns

from sklearn.metrics import roc_auc_score

from src.config import REPORTS_DIR

logger = logging.getLogger("churn_pipeline")
warnings.filterwarnings("ignore")


# ─── Overfitting Detection ───────────────────────────────────────────────────

def compute_overfitting_report(results_df: pd.DataFrame) -> pd.DataFrame:
    """
    For each model compute:
      - Train AUC, Test AUC, Gap
      - Train Recall, Test Recall, Gap
      - Overfitting severity: OK / MILD / MODERATE / SEVERE
    Returns enhanced DataFrame with overfitting diagnostics.
    """
    def severity(gap: float) -> str:
        if gap <= 0.03:
            return "✅ OK"
        elif gap <= 0.06:
            return "⚠️  MILD"
        elif gap <= 0.10:
            return "🟠 MODERATE"
        else:
            return "🔴 SEVERE"

    report_rows = []
    for _, row in results_df.iterrows():
        auc_gap = row.get("auc_gap", row.get("train_auc_roc", 0) - row.get("test_auc_roc", 0))
        recall_gap = row.get("recall_gap", row.get("train_recall", 0) - row.get("test_recall", 0))
        report_rows.append({
            "Model": row["model"],
            "Train AUC": round(row.get("train_auc_roc", np.nan), 4),
            "Test AUC": round(row.get("test_auc_roc", np.nan), 4),
            "AUC Gap": round(auc_gap, 4),
            "Train Recall": round(row.get("train_recall", np.nan), 4),
            "Test Recall": round(row.get("test_recall", np.nan), 4),
            "Recall Gap": round(recall_gap, 4),
            "Overfitting": severity(max(auc_gap, recall_gap)),
        })

    return pd.DataFrame(report_rows)


def print_overfitting_report(results_df: pd.DataFrame) -> None:
    """Print a formatted overfitting report to stdout."""
    report = compute_overfitting_report(results_df)
    print("\n" + "=" * 90)
    print("  OVERFITTING DETECTION REPORT")
    print("=" * 90)
    print(f"{'Model':<35} {'Train AUC':>10} {'Test AUC':>10} {'AUC Gap':>9} "
          f"{'Tr Recall':>10} {'Te Recall':>10} {'Re Gap':>8}  Status")
    print("-" * 90)
    for _, r in report.iterrows():
        print(
            f"{r['Model']:<35} "
            f"{r['Train AUC']:>10.4f} {r['Test AUC']:>10.4f} {r['AUC Gap']:>9.4f} "
            f"{r['Train Recall']:>10.4f} {r['Test Recall']:>10.4f} {r['Recall Gap']:>8.4f}  "
            f"{r['Overfitting']}"
        )
    print("=" * 90)
    logger.info("Overfitting report printed.")
    return report


def plot_overfitting_gaps(results_df: pd.DataFrame, save: bool = True) -> None:
    """
    Bar chart: Train vs Test AUC per model, with gap annotations.
    """
    models = results_df["model"].tolist()
    train_auc = results_df["train_auc_roc"].tolist()
    test_auc = results_df["test_auc_roc"].tolist()
    gaps = [t - v for t, v in zip(train_auc, test_auc)]

    x = np.arange(len(models))
    width = 0.35

    fig, axes = plt.subplots(1, 2, figsize=(20, 6))

    # ── AUC comparison ────────────────────────────────────────────────────
    bars1 = axes[0].bar(x - width/2, train_auc, width, label="Train AUC",
                        color="#3498db", alpha=0.85, edgecolor="white")
    bars2 = axes[0].bar(x + width/2, test_auc, width, label="Test AUC",
                        color="#e74c3c", alpha=0.85, edgecolor="white")
    for b, val in zip(bars1, train_auc):
        axes[0].text(b.get_x() + b.get_width()/2, b.get_height() + 0.003,
                     f"{val:.3f}", ha="center", va="bottom", fontsize=7.5, fontweight="bold")
    for b, val in zip(bars2, test_auc):
        axes[0].text(b.get_x() + b.get_width()/2, b.get_height() + 0.003,
                     f"{val:.3f}", ha="center", va="bottom", fontsize=7.5, fontweight="bold")
    axes[0].set_xticks(x)
    axes[0].set_xticklabels(models, rotation=35, ha="right", fontsize=9)
    axes[0].set_ylim(0.5, 1.05)
    axes[0].set_title("Train vs Test AUC-ROC per Model", fontweight="bold")
    axes[0].legend()
    axes[0].grid(True, alpha=0.3, axis="y")

    # ── Gap chart ─────────────────────────────────────────────────────────
    colors = ["#2ecc71" if g <= 0.05 else "#f39c12" if g <= 0.10 else "#e74c3c"
              for g in gaps]
    axes[1].bar(models, gaps, color=colors, edgecolor="white")
    axes[1].axhline(0.05, color="#f39c12", linestyle="--", alpha=0.7, label="Mild threshold (0.05)")
    axes[1].axhline(0.10, color="#e74c3c", linestyle="--", alpha=0.7, label="Severe threshold (0.10)")
    for i, (m, g) in enumerate(zip(models, gaps)):
        axes[1].text(i, g + 0.002, f"{g:.3f}", ha="center", va="bottom", fontsize=8.5, fontweight="bold")
    axes[1].set_xticklabels(models, rotation=35, ha="right", fontsize=9)
    axes[1].set_title("Overfitting Gap (Train AUC − Test AUC)", fontweight="bold")
    axes[1].set_ylabel("AUC Gap")
    axes[1].legend(fontsize=9)
    axes[1].grid(True, alpha=0.3, axis="y")

    plt.suptitle("Overfitting Analysis", fontsize=14, fontweight="bold", y=1.01)
    plt.tight_layout()

    if save:
        REPORTS_DIR.mkdir(exist_ok=True)
        path = REPORTS_DIR / "overfitting_analysis.png"
        plt.savefig(path, dpi=150, bbox_inches="tight")
        logger.info(f"Saved overfitting plot → {path}")
    plt.close()


# ─── SHAP Explainability ─────────────────────────────────────────────────────

def run_shap_analysis(
    model,
    X_train: pd.DataFrame,
    X_test: pd.DataFrame,
    feature_names: list = None,
    model_name: str = "Best Model",
    max_display: int = 20,
    n_background: int = 100,
) -> None:
    """
    Generate SHAP Summary Plot, Bar Plot, and Top-N feature table.
    Supports tree-based models (TreeExplainer) and others (KernelExplainer).
    Works with sklearn Pipeline: extracts the final estimator automatically.
    """
    import shap

    if feature_names is None:
        feature_names = list(X_test.columns) if hasattr(X_test, "columns") else None

    # ── Transform data through pipeline preprocessor ──────────────────────
    try:
        # If model is a sklearn Pipeline, extract preprocessor + final estimator
        if hasattr(model, "named_steps"):
            pre = model.named_steps.get("pre")
            rfe = model.named_steps.get("rfe")
            clf = model.named_steps.get("clf")
            X_train_t = pre.transform(X_train) if pre is not None else X_train
            X_test_t = pre.transform(X_test) if pre is not None else X_test
            if rfe is not None:
                X_train_t = rfe.transform(X_train_t)
                X_test_t = rfe.transform(X_test_t)
            # Try to get feature names from preprocessor
            try:
                feature_names = list(pre.get_feature_names_out())
                if rfe is not None and hasattr(rfe, "mask"):
                    feature_names = [feature_names[i] for i, m in enumerate(rfe.mask) if m]
            except Exception:
                pass
        elif hasattr(model, "best_estimator_"):
            # RandomizedSearchCV / Optuna result
            inner = model.best_estimator_
            if hasattr(inner, "named_steps"):
                pre = inner.named_steps.get("pre")
                rfe = inner.named_steps.get("rfe")
                clf = inner.named_steps.get("clf")
                X_train_t = pre.transform(X_train) if pre is not None else X_train
                X_test_t = pre.transform(X_test) if pre is not None else X_test
                if rfe is not None:
                    X_train_t = rfe.transform(X_train_t)
                    X_test_t = rfe.transform(X_test_t)
                try:
                    feature_names = list(pre.get_feature_names_out())
                    if rfe is not None and hasattr(rfe, "mask"):
                        feature_names = [feature_names[i] for i, m in enumerate(rfe.mask) if m]
                except Exception:
                    pass
            else:
                clf = inner
                X_train_t = X_train
                X_test_t = X_test
        else:
            clf = model
            X_train_t = X_train
            X_test_t = X_test
    except Exception as e:
        logger.warning(f"SHAP pipeline extraction failed: {e} — using raw model")
        clf = model
        X_train_t = X_train
        X_test_t = X_test

    # ── Convert to numpy ──────────────────────────────────────────────────
    if hasattr(X_train_t, "toarray"):
        X_train_t = X_train_t.toarray()
    if hasattr(X_test_t, "toarray"):
        X_test_t = X_test_t.toarray()
    X_train_t = np.array(X_train_t, dtype=np.float32)
    X_test_t = np.array(X_test_t, dtype=np.float32)

    if feature_names is not None and len(feature_names) != X_test_t.shape[1]:
        feature_names = [f"Feature_{i}" for i in range(X_test_t.shape[1])]

    # ── Build SHAP explainer ──────────────────────────────────────────────
    logger.info(f"Computing SHAP values for '{model_name}'...")
    try:
        # Try TreeExplainer first (fast, exact for trees)
        explainer = shap.TreeExplainer(clf)
        shap_values = explainer.shap_values(X_test_t)
        # For binary classifiers TreeExplainer may return list [class0, class1]
        if isinstance(shap_values, list):
            shap_values = shap_values[1]
        logger.info("  Using TreeExplainer (exact, fast)")
    except Exception:
        # Fallback to KernelExplainer (model-agnostic, slower)
        logger.info("  Falling back to KernelExplainer (may be slow)")
        bg_idx = np.random.choice(len(X_train_t), min(n_background, len(X_train_t)), replace=False)
        background = X_train_t[bg_idx]
        predict_fn = lambda x: clf.predict_proba(x)[:, 1]
        explainer = shap.KernelExplainer(predict_fn, background)
        shap_values = explainer.shap_values(X_test_t[:200], silent=True)

    REPORTS_DIR.mkdir(exist_ok=True)

    # ── Plot 1: SHAP Summary (beeswarm) ───────────────────────────────────
    fig, ax = plt.subplots(figsize=(12, 8))
    shap.summary_plot(
        shap_values, X_test_t,
        feature_names=feature_names,
        max_display=max_display,
        show=False,
        plot_type="dot",
    )
    plt.title(f"SHAP Summary Plot — {model_name}", fontsize=13, fontweight="bold", pad=15)
    plt.tight_layout()
    path = REPORTS_DIR / "shap_summary_plot.png"
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close()
    logger.info(f"  Saved SHAP summary plot → {path}")

    # ── Plot 2: SHAP Bar (mean absolute) ──────────────────────────────────
    fig, ax = plt.subplots(figsize=(12, 8))
    shap.summary_plot(
        shap_values, X_test_t,
        feature_names=feature_names,
        max_display=max_display,
        show=False,
        plot_type="bar",
    )
    plt.title(f"SHAP Feature Importance (Mean |SHAP|) — {model_name}",
              fontsize=13, fontweight="bold", pad=15)
    plt.tight_layout()
    path = REPORTS_DIR / "shap_bar_plot.png"
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close()
    logger.info(f"  Saved SHAP bar plot → {path}")

    # ── Table: Top-20 features ────────────────────────────────────────────
    mean_abs = np.abs(shap_values).mean(axis=0)
    feat_names = feature_names if feature_names else [f"Feature_{i}" for i in range(len(mean_abs))]
    top_df = pd.DataFrame({
        "Feature": feat_names,
        "Mean |SHAP|": mean_abs,
    }).sort_values("Mean |SHAP|", ascending=False).head(20).reset_index(drop=True)
    top_df.index += 1

    logger.info(f"\n  TOP-20 FEATURES DRIVING CHURN ({model_name}):")
    logger.info(top_df.to_string())

    # Save table
    top_df.to_csv(REPORTS_DIR / "shap_top20_features.csv", index=True)
    logger.info(f"  Saved SHAP top-20 table → {REPORTS_DIR / 'shap_top20_features.csv'}")

    # ── Interpret key drivers ─────────────────────────────────────────────
    top3 = top_df.head(3)["Feature"].tolist()
    logger.info(f"\n  KEY CHURN DRIVERS:")
    for i, feat in enumerate(top3, 1):
        mean_val = shap_values[:, feat_names.index(feat)].mean()
        direction = "increases" if mean_val > 0 else "decreases"
        logger.info(f"   {i}. '{feat}' — {direction} churn probability on average")

    return shap_values, top_df
