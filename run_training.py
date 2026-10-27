"""
Telco Churn Prediction — Main Training Script
==============================================
Run: python run_training.py

This script orchestrates the complete ML pipeline:
1. Data loading & cleaning (leak-free)
2. Feature engineering inside pipeline
3. Cross-validation comparison
4. Hyperparameter tuning (recall-optimized)
5. Threshold optimization
6. Probability calibration
7. Stacking ensemble
8. Model persistence
"""
import warnings
warnings.filterwarnings("ignore")
import sys
if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

from src.utils import setup_logging
from src.training import run_full_training
from src.evaluation import (
    plot_final_comparison,
    plot_business_impact,
    print_final_report,
    plot_threshold_analysis,
    plot_model_evaluation,
)


def main():
    logger = setup_logging()
    
    # Run complete training pipeline
    results = run_full_training()
    
    # Print final report
    print_final_report(results["results_df"], results.get("cv_summary"))
    
    # Generate plots
    try:
        plot_final_comparison(results["results_df"])
        plot_business_impact(results["results_df"])
        
        # Threshold analysis
        plot_threshold_analysis(
            results["thresh_df"],
            results["threshold"],
            results["threshold"],
        )
        
        # Evaluate best model visually
        plot_model_evaluation(
            results["best_model"],
            results["X_train"], results["y_train"],
            results["X_test"], results["y_test"],
            results["best_name"],
            threshold=results["threshold"],
        )
    except Exception as e:
        logger.warning(f"Plot generation failed (non-blocking): {e}")
    
    logger.info("\n✅ Training complete. Artifacts saved to models/ and reports/")
    logger.info(f"   Best model: {results['best_name']}")
    logger.info(f"   Optimal threshold: {results['threshold']:.2f}")
    
    return results


if __name__ == "__main__":
    main()
