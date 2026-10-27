"""
Final Academic Benchmark — Entry Point
=========================================
Orchestrates the complete academic pipeline:
  - Early stopping analysis
  - Scaler comparison (3 scalers × scale models)
  - Dual pipelines (PIPELINE_SCALE + PIPELINE_TREE)
  - Global benchmark ranking
  - Figure generation (reports/figures/)
  - Automatic analysis reports

Usage:
  python run_final_benchmark.py           # Full benchmark
  python run_final_benchmark.py --fast    # Skip stacking in scaler comparison
"""
from __future__ import annotations

import argparse
import logging
import sys
import warnings

warnings.filterwarnings("ignore")

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

from src.utils import setup_logging
from src.benchmark import run_global_benchmark
from src.visualization import generate_all_figures
from src.report_generator import generate_final_analysis, generate_final_recommendations


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Academic Benchmark — Customer Churn v4")
    parser.add_argument("--fast", action="store_true", help="Fast mode: skip stacking in scaler comparison")
    parser.add_argument("--no-shap", action="store_true", help="Skip SHAP analysis")
    return parser.parse_args()


def main() -> dict:
    args = parse_args()
    logger = setup_logging()

    logger.info("=" * 70)
    logger.info("  FINAL ACADEMIC BENCHMARK — Customer Churn Prediction v4")
    logger.info("=" * 70)

    results = run_global_benchmark(
        fast_mode=args.fast,
        include_stacking=not args.fast,
    )

    logger.info("\nGenerating figures...")
    figures = generate_all_figures(results, run_shap=not args.no_shap)
    logger.info(f"  {len(figures)} figures saved to reports/figures/")

    logger.info("\nGenerating analysis reports...")
    generate_final_analysis(results)
    generate_final_recommendations(results)

    df = results["benchmark_df"]
    logger.info("\n" + "=" * 70)
    logger.info("  BENCHMARK COMPLETE")
    logger.info("=" * 70)
    logger.info(f"  Models evaluated:     {len(df)}")
    logger.info(f"  Best ROC-AUC:         {df.iloc[0]['model']} ({df.iloc[0]['roc_auc']:.4f})")
    logger.info(f"  Best Recall:          {df.loc[df['recall'].idxmax(), 'model']} ({df['recall'].max():.4f})")
    logger.info(f"  Results:              results/final_benchmark.csv")
    logger.info(f"  Scaler comparison:    results/scaler_comparison.csv")
    logger.info(f"  Figures:              reports/figures/")
    logger.info(f"  Analysis:             reports/final_analysis.md")
    logger.info(f"  Recommendations:      reports/final_recommendations.md")

    return results


if __name__ == "__main__":
    main()
