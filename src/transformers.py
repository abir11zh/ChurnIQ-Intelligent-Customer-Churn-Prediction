"""
Custom sklearn Transformers and Model Wrappers
================================================
Reusable components for RFE masking, MLP wrapping, and pipeline compatibility.
"""
from __future__ import annotations

import logging
from typing import Any, Optional

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, ClassifierMixin, TransformerMixin

logger = logging.getLogger("churn_pipeline")


class RFEMaskTransformer(BaseEstimator, TransformerMixin):
    """Apply a boolean RFE support mask to pre-transformed feature arrays."""

    def __init__(self, support_mask: np.ndarray):
        self.support_mask = np.asarray(support_mask, dtype=bool)

    def fit(self, X: Any, y: Any = None) -> "RFEMaskTransformer":
        return self

    def transform(self, X: Any) -> np.ndarray:
        arr = np.asarray(X)
        return arr[:, self.support_mask]


class TransformedWrapper(BaseEstimator, ClassifierMixin):
    """Wrap a model trained on preprocessed arrays for raw DataFrame inference."""

    def __init__(
        self,
        model: Any,
        preprocessor: Any,
        rfe_transformer: Optional[Any] = None,
    ):
        self.model = model
        self.preprocessor = preprocessor
        self.rfe_transformer = rfe_transformer

    def fit(self, X: pd.DataFrame, y: Any) -> "TransformedWrapper":
        return self

    def _transform(self, X: pd.DataFrame) -> np.ndarray:
        Xt = self.preprocessor.transform(X)
        if self.rfe_transformer is not None:
            Xt = self.rfe_transformer.transform(Xt)
        return np.asarray(Xt, dtype=np.float32)

    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        return self.model.predict_proba(self._transform(X))

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        return self.model.predict(self._transform(X))


class TransformedWrapperMLP(TransformedWrapper):
    """Alias for MLP models — same interface, explicit naming in v3 pipeline."""

    pass
