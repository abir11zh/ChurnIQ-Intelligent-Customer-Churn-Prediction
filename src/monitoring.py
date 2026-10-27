"""
Monitoring Module — PSI, Data Drift, Prediction Drift
"""
import numpy as np
import pandas as pd
import logging
from src.config import PSI_STABLE, PSI_DRIFT

logger = logging.getLogger("churn_pipeline")


def compute_psi(expected: np.ndarray, actual: np.ndarray, bins: int = 10) -> float:
    """
    Population Stability Index (PSI).
    PSI < 0.1  → Stable
    PSI 0.1-0.2 → Monitor
    PSI > 0.2  → Retrain
    """
    breakpoints = np.percentile(expected, np.linspace(0, 100, bins + 1))
    breakpoints[0] = -np.inf
    breakpoints[-1] = np.inf
    
    expected_pct = np.histogram(expected, bins=breakpoints)[0] / len(expected)
    actual_pct = np.histogram(actual, bins=breakpoints)[0] / len(actual)
    
    # Avoid division by zero
    expected_pct = np.clip(expected_pct, 1e-10, None)
    actual_pct = np.clip(actual_pct, 1e-10, None)
    
    psi = np.sum((actual_pct - expected_pct) * np.log(actual_pct / expected_pct))
    return float(psi)


def check_data_drift(train_df: pd.DataFrame, production_df: pd.DataFrame,
                     numerical_cols: list = None) -> dict:
    """
    Check data drift for all numerical columns.
    Returns dict of feature → (psi_value, status).
    """
    if numerical_cols is None:
        numerical_cols = train_df.select_dtypes(include=[np.number]).columns.tolist()
    
    results = {}
    for col in numerical_cols:
        if col in train_df.columns and col in production_df.columns:
            psi = compute_psi(train_df[col].values, production_df[col].values)
            
            if psi < PSI_STABLE:
                status = "✓ STABLE"
            elif psi < PSI_DRIFT:
                status = "⚠️  MONITOR"
            else:
                status = "🚨 RETRAIN"
            
            results[col] = {"psi": psi, "status": status}
            logger.info(f"  {col:<25} PSI={psi:.4f} {status}")
    
    return results


def check_prediction_drift(reference_probas: np.ndarray,
                           current_probas: np.ndarray) -> dict:
    """Check if prediction distribution has shifted."""
    psi = compute_psi(reference_probas, current_probas)
    
    if psi < PSI_STABLE:
        status = "✓ STABLE"
    elif psi < PSI_DRIFT:
        status = "⚠️  MONITOR"
    else:
        status = "🚨 RETRAIN"
    
    result = {
        "psi": psi,
        "status": status,
        "ref_mean": float(np.mean(reference_probas)),
        "cur_mean": float(np.mean(current_probas)),
        "ref_std": float(np.std(reference_probas)),
        "cur_std": float(np.std(current_probas)),
    }
    
    logger.info(f"Prediction Drift — PSI={psi:.4f} {status}")
    return result
