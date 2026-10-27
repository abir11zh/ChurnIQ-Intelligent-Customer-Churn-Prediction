"""
Advanced Feature Engineering Module
=====================================
Implements all 6 requested engineered features with proper zero-division
handling, tenure group encoding, and feature impact evaluation.
"""
import numpy as np
import pandas as pd
import logging
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger("churn_pipeline")


# ─── Extended FeatureEngineer ────────────────────────────────────────────────

class AdvancedFeatureEngineer(BaseEstimator, TransformerMixin):
    """
    Implements 6 advanced features:
      1. AvgMonthlySpend   = TotalCharges / (tenure + 1)         [zero-div safe]
      2. CustomerValue     = MonthlyCharges * tenure
      3. ContractRisk      = 1 if Month-to-month, else 0
      4. TenureGroup       = categorical bucket {0-12, 12-24, 24-48, 48+}
      5. ServiceCount      = number of active services (0–8)
      6. ChargesRatio      = MonthlyCharges / AvgMonthlySpend     [zero-div safe]
    Also retains existing features: NoServices, IsMonthToMonth, NumServices.
    """

    SERVICE_COLS = [
        "PhoneService", "InternetService", "StreamingTV", "StreamingMovies",
        "OnlineBackup", "OnlineSecurity", "DeviceProtection", "TechSupport",
    ]

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        df = X.copy()

        # ── Feature 1: Average Monthly Spending ──────────────────────────────
        # AvgSpend = TotalCharges / tenure   (+ 1 to avoid zero-div)
        if "TotalCharges" in df.columns:
            df["AvgMonthlySpend"] = df["TotalCharges"] / (df["tenure"] + 1)
        else:
            # If TotalCharges already dropped, approximate from MonthlyCharges
            df["AvgMonthlySpend"] = df["MonthlyCharges"] * df["tenure"] / (df["tenure"] + 1)

        # ── Feature 2: Customer Value ─────────────────────────────────────────
        df["CustomerValue"] = df["MonthlyCharges"] * df["tenure"]

        # ── Feature 3: Contract Risk ──────────────────────────────────────────
        if "Contract" in df.columns:
            df["ContractRisk"] = (df["Contract"] == "Month-to-month").astype(int)
            # Also keep IsMonthToMonth for backward compat
            df["IsMonthToMonth"] = df["ContractRisk"]

        # ── Feature 4: Tenure Groups ──────────────────────────────────────────
        df["TenureGroup"] = pd.cut(
            df["tenure"],
            bins=[-1, 12, 24, 48, 9999],
            labels=["0-12", "12-24", "24-48", "48+"],
        ).astype(str)

        # ── Feature 5: Service Count ──────────────────────────────────────────
        present_svc = [c for c in self.SERVICE_COLS if c in df.columns]
        if present_svc:
            def is_active(val):
                return val not in ("No", "No internet service", "No phone service")

            df["ServiceCount"] = df[present_svc].apply(
                lambda row: sum(is_active(v) for v in row), axis=1
            )
            # Also recompute NoServices & NumServices for backward compat
            internet_svc = [
                c for c in ["OnlineSecurity", "OnlineBackup", "DeviceProtection",
                             "TechSupport", "StreamingTV", "StreamingMovies"]
                if c in df.columns
            ]
            if internet_svc:
                df["NoServices"] = (
                    df[internet_svc]
                    .apply(lambda x: (x == "No internet service") | (x == "No"), axis=0)
                    .all(axis=1)
                    .astype(int)
                )
                df["NumServices"] = (
                    df[internet_svc]
                    .apply(lambda x: ~((x == "No internet service") | (x == "No")), axis=0)
                    .sum(axis=1)
                )

        # ── Feature 6: Charges Ratio ──────────────────────────────────────────
        # MonthlyCharges / AvgMonthlySpend  (safe: clip denominator to ε)
        eps = 1e-6
        df["ChargesRatio"] = df["MonthlyCharges"] / (df["AvgMonthlySpend"] + eps)
        # Clip to remove any extreme outliers caused by new customers (tenure=0)
        df["ChargesRatio"] = df["ChargesRatio"].clip(0, 10)

        return df


# ─── Feature Impact Evaluation ───────────────────────────────────────────────

def evaluate_feature_impact(
    X: pd.DataFrame,
    y: pd.Series,
    new_features: list,
    base_features: list = None,
    cv: int = 5,
    random_state: int = 42,
) -> pd.DataFrame:
    """
    Compare AUC with vs without each new feature using LogisticRegression CV.
    Returns a DataFrame with per-feature impact and keep/drop recommendation.
    """
    skf = StratifiedKFold(n_splits=cv, shuffle=True, random_state=random_state)
    scaler = StandardScaler()
    lr = LogisticRegression(max_iter=1000, random_state=random_state, C=1.0)

    # Baseline: numeric columns only (no new features)
    if base_features is None:
        base_features = [
            c for c in X.select_dtypes(include=[np.number]).columns
            if c not in new_features
        ]

    X_base = X[base_features].fillna(0)
    X_base_scaled = scaler.fit_transform(X_base)
    base_auc = cross_val_score(
        lr, X_base_scaled, y, cv=skf, scoring="roc_auc"
    ).mean()

    results = []
    for feat in new_features:
        if feat not in X.columns:
            logger.warning(f"Feature '{feat}' not found — skipping impact test")
            continue
        if not pd.api.types.is_numeric_dtype(X[feat]):
            continue  # skip non-numeric (TenureGroup is string)

        cols = base_features + [feat]
        X_aug = X[cols].fillna(0)
        X_aug_scaled = scaler.fit_transform(X_aug)
        aug_auc = cross_val_score(
            lr, X_aug_scaled, y, cv=skf, scoring="roc_auc"
        ).mean()

        delta = aug_auc - base_auc
        keep = delta >= -0.001  # keep if neutral or positive
        results.append({
            "feature": feat,
            "base_auc": round(base_auc, 4),
            "aug_auc": round(aug_auc, 4),
            "delta_auc": round(delta, 4),
            "recommendation": "KEEP" if keep else "DROP",
        })
        logger.info(
            f"  Feature '{feat}': AUC {base_auc:.4f} → {aug_auc:.4f}  "
            f"Δ={delta:+.4f}  {'✅ KEEP' if keep else '❌ DROP'}"
        )

    return pd.DataFrame(results)


def get_advanced_feature_lists(X: pd.DataFrame) -> tuple:
    """
    Return (num_cols, bin_cols, cat_cols) for the advanced feature set.
    Includes all engineered features appropriate to their type.
    """
    from src.config import BINARY_FEATURES, CATEGORICAL_FEATURES

    # Numerical: original + engineered
    num_cols = [
        c for c in [
            "tenure", "MonthlyCharges",
            "AvgMonthlySpend", "CustomerValue",
            "ServiceCount", "NumServices", "ChargesRatio",
        ] if c in X.columns
    ]

    # Binary: original + engineered flags
    extra_bin = ["NoServices", "IsMonthToMonth", "ContractRisk"]
    bin_cols = [c for c in BINARY_FEATURES + extra_bin if c in X.columns]
    # Remove duplicates while preserving order
    seen = set()
    bin_cols = [c for c in bin_cols if not (c in seen or seen.add(c))]

    # Categorical: original + TenureGroup
    cat_cols = [
        c for c in CATEGORICAL_FEATURES + ["TenureGroup"]
        if c in X.columns
    ]

    return num_cols, bin_cols, cat_cols
