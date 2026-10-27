"""
Pipeline Builders — PIPELINE_SCALE & PIPELINE_TREE
====================================================
Constructs sklearn pipelines with correct preprocessing per model family.
"""
from __future__ import annotations

import logging
from typing import Any, Dict, List, Tuple

import pandas as pd
from sklearn.pipeline import Pipeline

from src.models.factory import (
    build_model_pipeline,
    build_scale_stacking,
    get_scale_models,
    get_tree_models,
)
from src.preprocessing import (
    build_scale_preprocessor,
    build_tree_preprocessor,
    get_feature_lists,
)

logger = logging.getLogger("churn_pipeline")


def _get_column_groups(X: pd.DataFrame) -> Tuple[List[str], List[str], List[str]]:
    """Extract feature column groups from training data."""
    return get_feature_lists(X)


def build_pipeline_scale(
    X_train: pd.DataFrame,
    scale_pos_weight: float = 1.0,
    scaler_name: str = "standard",
    include_stacking: bool = True,
) -> Dict[str, Any]:
    """
    PIPELINE_SCALE: Logistic Regression, SVM, KNN, MLP (+ optional Stacking).

    All models receive: imputation → scaler → one-hot encoding.
    Scaler options: standard, robust, power.
    """
    num_cols, bin_cols, cat_cols = _get_column_groups(X_train)
    preprocessor = build_scale_preprocessor(num_cols, bin_cols, cat_cols, scaler_name=scaler_name)

    pipelines: Dict[str, Any] = {}
    for name, model in get_scale_models(scale_pos_weight).items():
        pipelines[name] = build_model_pipeline(preprocessor, model, name)

    if include_stacking:
        pipelines[f"Stacking ({scaler_name})"] = build_scale_stacking(
            preprocessor, scale_pos_weight
        )

    logger.info(
        f"PIPELINE_SCALE built: {len(pipelines)} models, scaler={scaler_name}"
    )
    return pipelines


def build_pipeline_tree(
    X_train: pd.DataFrame,
    scale_pos_weight: float = 1.0,
) -> Dict[str, Pipeline]:
    """
    PIPELINE_TREE: Decision Tree, RF, Extra Trees, XGBoost, LightGBM, CatBoost.

    Tree models receive ONLY: imputation → one-hot encoding (NO scaling).
    Tree splits are invariant to monotonic scaling — scaling is unnecessary
    and would only add computational cost without improving performance.
    """
    num_cols, bin_cols, cat_cols = _get_column_groups(X_train)
    preprocessor = build_tree_preprocessor(num_cols, bin_cols, cat_cols)

    pipelines: Dict[str, Pipeline] = {}
    for name, model in get_tree_models(scale_pos_weight).items():
        pipelines[name] = build_model_pipeline(preprocessor, model, name)

    logger.info(f"PIPELINE_TREE built: {len(pipelines)} models (no scaling)")
    return pipelines
