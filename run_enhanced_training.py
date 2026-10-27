"""
Enhanced Training Entry Point — v3.0
======================================
Runs the full enhanced pipeline with:
  - Advanced Feature Engineering (6 new features)
  - MLP Deep Learning (TF/Keras, v1 + v2 + Optuna)
  - Optuna optimization: XGBoost, LightGBM, MLP (100 trials each)
  - Advanced Stacking (6 base models + LR/XGB meta learner)
  - Full evaluation: 8 metrics per model
  - Overfitting detection with gap reports
  - SHAP explainability (Summary, Bar, Top-20)
  - Final ranked comparison table

Usage:
  Full run (100 Optuna trials each):
    python run_enhanced_training.py

  Fast run (20 trials, for testing):
    python run_enhanced_training.py --fast

  Skip Optuna (baselines only):
    python run_enhanced_training.py --no-optuna
"""
import sys
import warnings
import argparse
import logging
warnings.filterwarnings("ignore")

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

from src.utils import setup_logging
from src.enhanced_training import run_enhanced_training
from src.evaluation import (
    plot_final_comparison,
    plot_business_impact,
    plot_model_evaluation,
    plot_threshold_analysis,
    print_final_report,
)


def parse_args():
    parser = argparse.ArgumentParser(description="Enhanced Churn Training Pipeline v3.0")
    parser.add_argument(
        "--fast", action="store_true",
        help="Fast mode: 20 Optuna trials instead of 100"
    )
    parser.add_argument(
        "--no-optuna", action="store_true",
        help="Skip all Optuna optimization (fastest)"
    )
    parser.add_argument(
        "--trials", type=int, default=100,
        help="Number of Optuna trials per optimizer (default: 100)"
    )
    parser.add_argument(
        "--no-mlp-stack", action="store_true",
        help="Exclude MLP from stacking ensemble"
    )
    return parser.parse_args()


def main():
    args = parse_args()
    logger = setup_logging()

    n_trials = 20 if args.fast else args.trials
    run_optuna = not args.no_optuna

    logger.info("=" * 70)
    logger.info("  ENHANCED TELCO CHURN PREDICTION — v3.0")
    logger.info(f"  Optuna trials: {n_trials} per optimizer")
    logger.info(f"  Optuna enabled: {run_optuna}")
    logger.info("=" * 70)

    # Run enhanced pipeline
    results = run_enhanced_training(
        n_optuna_trials=n_trials,
        run_mlp_optuna=run_optuna,
        run_xgb_optuna=run_optuna,
        run_lgbm_optuna=run_optuna,
        include_mlp_in_stacking=not args.no_mlp_stack,
    )

    # ── Additional plots ──────────────────────────────────────────────────
    try:
        logger.info("\nGenerating evaluation plots...")
        plot_final_comparison(results["results_df"])
        plot_business_impact(results["results_df"])
        plot_threshold_analysis(
            results["thresh_df"],
            results["threshold"],
            results["threshold"],
        )
        plot_model_evaluation(
            results["best_model"],
            results["X_train"], results["y_train"],
            results["X_test"], results["y_test"],
            results["best_name"],
            threshold=results["threshold"],
        )
    except Exception as e:
        logger.warning(f"Plot generation warning: {e}")

    logger.info("\n✅ Enhanced Training Complete!")
    logger.info(f"   Best model:        {results['best_name']}")
    logger.info(f"   Optimal threshold: {results['threshold']:.2f}")
    logger.info(f"   Artifacts saved:   models/ & reports/")
    
    # Generate markdown report
    try:
        import subprocess
        from src.config import REPORTS_DIR, TRAINING_REPORT_PATH
        out_report = REPORTS_DIR / "training_report.md"
        subprocess.run(
            [sys.executable, "generate_report.py", "--input", str(TRAINING_REPORT_PATH), "--output", str(out_report)],
            check=True
        )
        logger.info(f"   Markdown Report:   {out_report}")
    except Exception as e:
        logger.warning(f"Failed to generate markdown report: {e}")

    return results


if __name__ == "__main__":
    main()
