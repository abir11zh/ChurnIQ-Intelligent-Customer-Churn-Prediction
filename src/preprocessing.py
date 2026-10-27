"""
Preprocessing — Leak-Free sklearn Pipeline
==========================================
Provides two preprocessor families:
  - PIPELINE_SCALE: imputation + scaler + encoding (for LR, SVM, KNN, MLP)
  - PIPELINE_TREE:  imputation + encoding only (tree models are scale-invariant)
"""
from __future__ import annotations

from typing import List, Optional, Tuple, Union

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import (
    OneHotEncoder,
    PowerTransformer,
    RobustScaler,
    StandardScaler,
)
import logging

from src.config import (
    SERVICE_COLUMNS, TARGET_COL, ID_COL, RANDOM_STATE
)

logger = logging.getLogger("churn_pipeline")


class DataCleaner(BaseEstimator, TransformerMixin):
    """Cleans raw Telco data: TotalCharges fix, SeniorCitizen, drop ID."""
    def fit(self, X, y=None):
        return self
    
    def transform(self, X):
        df = X.copy()
        if ID_COL in df.columns:
            df = df.drop(columns=[ID_COL])
        df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
        mask = df["TotalCharges"].isna()
        df.loc[mask, "TotalCharges"] = df.loc[mask, "tenure"] * df.loc[mask, "MonthlyCharges"]
        if df["SeniorCitizen"].dtype in [np.int64, np.int32, int]:
            df["SeniorCitizen"] = df["SeniorCitizen"].map({0: "No", 1: "Yes"})
        return df


class FeatureEngineer(BaseEstimator, TransformerMixin):
    """Creates: AvgMonthlySpend, NoServices, IsMonthToMonth, NumServices."""
    def fit(self, X, y=None):
        return self
    
    def transform(self, X):
        df = X.copy()
        df["AvgMonthlySpend"] = df["TotalCharges"] / (df["tenure"] + 1)
        svc = [c for c in SERVICE_COLUMNS if c in df.columns]
        if svc:
            df["NoServices"] = (
                df[svc].apply(lambda x: (x == "No internet service") | (x == "No"), axis=0)
                .all(axis=1).astype(int)
            )
            df["NumServices"] = (
                df[svc].apply(lambda x: ~((x == "No internet service") | (x == "No")), axis=0)
                .sum(axis=1)
            )
        if "Contract" in df.columns:
            df["IsMonthToMonth"] = (df["Contract"] == "Month-to-month").astype(int)
        return df


def get_feature_lists(X):
    """Return (num_cols, bin_cols, cat_cols) from dataframe."""
    from src.config import BINARY_FEATURES, CATEGORICAL_FEATURES
    num_cols = [c for c in ["tenure", "MonthlyCharges", "AvgMonthlySpend", "NumServices"] if c in X.columns]
    bin_cols = [c for c in BINARY_FEATURES if c in X.columns]
    eng_bin = [c for c in ["NoServices", "IsMonthToMonth"] if c in X.columns]
    cat_cols = [c for c in CATEGORICAL_FEATURES if c in X.columns]
    return num_cols, bin_cols + eng_bin, cat_cols


def get_scaler(scaler_name: str = "standard"):
    """Return a scaler instance by name."""
    scalers = {
        "standard": StandardScaler(),
        "robust": RobustScaler(),
        "power": PowerTransformer(method="yeo-johnson", standardize=True),
    }
    if scaler_name not in scalers:
        raise ValueError(f"Unknown scaler: {scaler_name}. Choose from {list(scalers)}")
    return scalers[scaler_name]


def build_tree_preprocessor(
    num_cols: List[str],
    bin_cols: List[str],
    cat_cols: List[str],
) -> ColumnTransformer:
    """
    PIPELINE_TREE preprocessor: imputation + categorical encoding ONLY.

    Tree-based models (Decision Tree, RF, Extra Trees, XGBoost, LightGBM, CatBoost)
    do NOT require feature scaling because:
      - Splits are based on feature ordering/thresholds, not distances
      - Monotonic transformations (scaling) do not change split structure
      - Scaling adds computational overhead without improving tree performance
    """
    num_pipe = _numeric_imputer_pipeline()
    return ColumnTransformer(
        transformers=[
            ("num", num_pipe, num_cols),
            ("bin", OneHotEncoder(drop="if_binary", sparse_output=False, handle_unknown="ignore"), bin_cols),
            ("cat", OneHotEncoder(drop="first", sparse_output=False, handle_unknown="ignore"), cat_cols),
        ],
        remainder="drop",
        verbose_feature_names_out=False,
    )


def build_scale_preprocessor(
    num_cols: List[str],
    bin_cols: List[str],
    cat_cols: List[str],
    scaler_name: str = "standard",
) -> ColumnTransformer:
    """
    PIPELINE_SCALE preprocessor: imputation + scaler + encoding.
    Used for distance/gradient-based models: LR, SVM, KNN, MLP.
    """
    scaler = get_scaler(scaler_name)
    num_pipe = _numeric_imputer_scaler_pipeline(scaler)
    return ColumnTransformer(
        transformers=[
            ("num", num_pipe, num_cols),
            ("bin", OneHotEncoder(drop="if_binary", sparse_output=False, handle_unknown="ignore"), bin_cols),
            ("cat", OneHotEncoder(drop="first", sparse_output=False, handle_unknown="ignore"), cat_cols),
        ],
        remainder="drop",
        verbose_feature_names_out=False,
    )


def _numeric_imputer_pipeline() -> Pipeline:
    """Numeric pipeline: median imputation only (no scaling)."""
    return Pipeline([("imputer", SimpleImputer(strategy="median"))])


def _numeric_imputer_scaler_pipeline(scaler) -> Pipeline:
    """Numeric pipeline: median imputation + scaling."""
    return Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", scaler),
    ])


def build_preprocessor(num_cols, bin_cols, cat_cols, scaler_name: str = "standard"):
    """Build ColumnTransformer with configurable scaler (backward compatible)."""
    return build_scale_preprocessor(num_cols, bin_cols, cat_cols, scaler_name=scaler_name)


def load_and_clean_data(filepath=None):
    """Load CSV, clean, engineer features, drop TotalCharges. Returns (df, X, y)."""
    from src.config import RAW_DATA_PATH
    if filepath is None:
        filepath = RAW_DATA_PATH
    
    logger.info(f"Loading data from {filepath}")
    df = pd.read_csv(str(filepath))
    logger.info(f"Raw shape: {df.shape}")
    
    df = DataCleaner().transform(df)
    df[TARGET_COL] = df[TARGET_COL].map({"Yes": 1, "No": 0})
    df = FeatureEngineer().transform(df)
    
    # Drop TotalCharges (high VIF with tenure)
    if "TotalCharges" in df.columns:
        df = df.drop(columns=["TotalCharges"])
    
    y = df[TARGET_COL]
    X = df.drop(columns=[TARGET_COL])
    logger.info(f"Cleaned shape: {X.shape}, Churn rate: {y.mean()*100:.2f}%")
    return df, X, y


def get_preprocessor_from_data(X_train):
    """Build ColumnTransformer from actual training data columns."""
    num_cols, bin_cols, cat_cols = get_feature_lists(X_train)
    logger.info(f"Num({len(num_cols)}): {num_cols}")
    logger.info(f"Bin({len(bin_cols)}): {bin_cols}")
    logger.info(f"Cat({len(cat_cols)}): {cat_cols}")
    return build_preprocessor(num_cols, bin_cols, cat_cols)
