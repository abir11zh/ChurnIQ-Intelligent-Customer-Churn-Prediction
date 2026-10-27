"""
Model Factory — Centralized Model Instantiation
=================================================
Creates model instances for PIPELINE_SCALE and PIPELINE_TREE with
fixed hyperparameters from config (reproducibility).
"""
from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional, Tuple

from catboost import CatBoostClassifier
from lightgbm import LGBMClassifier
from sklearn.ensemble import ExtraTreesClassifier, RandomForestClassifier, StackingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import Pipeline
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from xgboost import XGBClassifier

from src.config import (
    RANDOM_STATE,
    CV_FOLDS,
    CV_SHUFFLE,
    LOGISTIC_REGRESSION_PARAMS,
    RANDOM_FOREST_PARAMS,
    XGBOOST_PARAMS,
    LIGHTGBM_PARAMS,
    CATBOOST_PARAMS,
    SVM_PARAMS,
    KNN_PARAMS,
    MLP_CLASSIFIER_PARAMS,
    DECISION_TREE_PARAMS,
    EXTRA_TREES_PARAMS,
)

logger = logging.getLogger("churn_pipeline")


def get_scale_models(scale_pos_weight: float = 1.0) -> Dict[str, Any]:
    """
    Models requiring feature normalization (PIPELINE_SCALE).
    Returns dict of model_name → sklearn estimator.
    """
    return {
        "Logistic Regression": LogisticRegression(**LOGISTIC_REGRESSION_PARAMS),
        "SVM": SVC(**SVM_PARAMS),
        "KNN": KNeighborsClassifier(**KNN_PARAMS),
        "MLP": MLPClassifier(**MLP_CLASSIFIER_PARAMS),
    }


def get_tree_models(scale_pos_weight: float = 1.0) -> Dict[str, Any]:
    """
    Tree-based models (PIPELINE_TREE) — no scaling applied.
    """
    xgb_params = {**XGBOOST_PARAMS, "scale_pos_weight": scale_pos_weight}
    lgbm_params = {**LIGHTGBM_PARAMS, "scale_pos_weight": scale_pos_weight}
    cat_params = {**CATBOOST_PARAMS, "auto_class_weights": "Balanced"}

    return {
        "Decision Tree": DecisionTreeClassifier(**DECISION_TREE_PARAMS),
        "Random Forest": RandomForestClassifier(**RANDOM_FOREST_PARAMS),
        "Extra Trees": ExtraTreesClassifier(**EXTRA_TREES_PARAMS),
        "XGBoost": XGBClassifier(**xgb_params),
        "LightGBM": LGBMClassifier(**lgbm_params),
        "CatBoost": CatBoostClassifier(**cat_params),
    }


def build_model_pipeline(
    preprocessor: Any,
    model: Any,
    model_name: str,
) -> Pipeline:
    """Wrap preprocessor + classifier in a sklearn Pipeline."""
    return Pipeline([("pre", preprocessor), ("clf", model)])


def build_scale_stacking(
    preprocessor: Any,
    scale_pos_weight: float = 1.0,
) -> StackingClassifier:
    """
    Stacking ensemble using only scale-dependent base learners.
    Meta-learner: Logistic Regression.
    """
    scale_models = get_scale_models(scale_pos_weight)
    base_estimators: List[Tuple[str, Pipeline]] = []

    for short_name, clf in scale_models.items():
        key = short_name.lower().replace(" ", "_")[:6]
        base_estimators.append((
            key,
            Pipeline([("pre", preprocessor), ("clf", clf)]),
        ))

    meta = LogisticRegression(
        C=0.1,
        class_weight="balanced",
        max_iter=1000,
        random_state=RANDOM_STATE,
    )

    return StackingClassifier(
        estimators=base_estimators,
        final_estimator=meta,
        cv=StratifiedKFold(n_splits=CV_FOLDS, shuffle=CV_SHUFFLE, random_state=RANDOM_STATE),
        stack_method="predict_proba",
        passthrough=False,
        n_jobs=-1,
    )
