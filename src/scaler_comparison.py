"""
Scaler Comparison Study
========================
Compare StandardScaler, RobustScaler, and PowerTransformer across
all scale-dependent models with identical validation protocol.
"""
from __future__ import annotations

import logging
from typing import Any, Dict, List

import pandas as pd
from sklearn.base import clone

from src.config import SCALER_COMPARISON_PATH, SCALER_NAMES
from src.metrics import evaluate_with_timing, results_to_dataframe
from src.pipeline_builders import build_pipeline_scale

logger = logging.getLogger("churn_pipeline")


def run_scaler_comparison(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    scale_pos_weight: float = 1.0,
    include_stacking: bool = True,
) -> pd.DataFrame:
    """
    For each scaler, retrain all scale-dependent models with the same
    hyperparameters and validation protocol. Returns comparison DataFrame.
    """
    all_results: List[Dict[str, Any]] = []

    for scaler_key, scaler_label in SCALER_NAMES.items():
        logger.info(f"\n{'='*60}")
        logger.info(f"  SCALER COMPARISON — {scaler_label}")
        logger.info(f"{'='*60}")

        pipelines = build_pipeline_scale(
            X_train,
            scale_pos_weight=scale_pos_weight,
            scaler_name=scaler_key,
            include_stacking=include_stacking,
        )

        for model_name, pipe in pipelines.items():
            logger.info(f"  Training {model_name} with {scaler_label}...")
            try:
                result = evaluate_with_timing(
                    clone(pipe),
                    X_train, y_train,
                    X_test, y_test,
                    model_name=model_name,
                    scaler=scaler_label,
                )
                all_results.append(result)
            except Exception as exc:
                logger.error(f"  Failed {model_name}/{scaler_label}: {exc}")

    df = results_to_dataframe(all_results)
    SCALER_COMPARISON_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(SCALER_COMPARISON_PATH, index=False)
    logger.info(f"Scaler comparison saved → {SCALER_COMPARISON_PATH}")

    return df
