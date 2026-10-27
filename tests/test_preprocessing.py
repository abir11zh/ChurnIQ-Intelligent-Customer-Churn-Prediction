"""Tests for preprocessing module."""
import pytest
import numpy as np
import pandas as pd
from src.preprocessing import DataCleaner, FeatureEngineer, load_and_clean_data, get_feature_lists


def make_sample_row():
    return pd.DataFrame([{
        "customerID": "TEST-001",
        "gender": "Male",
        "SeniorCitizen": 0,
        "Partner": "Yes",
        "Dependents": "No",
        "tenure": 12,
        "PhoneService": "Yes",
        "MultipleLines": "No",
        "InternetService": "Fiber optic",
        "OnlineSecurity": "No",
        "OnlineBackup": "No",
        "DeviceProtection": "No",
        "TechSupport": "No",
        "StreamingTV": "No",
        "StreamingMovies": "No",
        "Contract": "Month-to-month",
        "PaperlessBilling": "Yes",
        "PaymentMethod": "Electronic check",
        "MonthlyCharges": 70.0,
        "TotalCharges": "840.0",
        "Churn": "Yes",
    }])


def test_data_cleaner_drops_id():
    df = make_sample_row()
    result = DataCleaner().transform(df)
    assert "customerID" not in result.columns


def test_data_cleaner_fixes_total_charges():
    df = make_sample_row()
    df.loc[0, "TotalCharges"] = " "  # Blank string like real data
    result = DataCleaner().transform(df)
    assert not result["TotalCharges"].isna().any()
    # Should impute as tenure × MonthlyCharges
    assert result["TotalCharges"].iloc[0] == 12 * 70.0


def test_data_cleaner_converts_senior_citizen():
    df = make_sample_row()
    result = DataCleaner().transform(df)
    assert result["SeniorCitizen"].iloc[0] in ("Yes", "No")


def test_feature_engineer_creates_features():
    df = make_sample_row()
    df = DataCleaner().transform(df)
    result = FeatureEngineer().transform(df)
    assert "AvgMonthlySpend" in result.columns
    assert "NoServices" in result.columns
    assert "IsMonthToMonth" in result.columns
    assert "NumServices" in result.columns


def test_feature_engineer_month_to_month_flag():
    df = make_sample_row()
    df = DataCleaner().transform(df)
    result = FeatureEngineer().transform(df)
    assert result["IsMonthToMonth"].iloc[0] == 1


def test_feature_engineer_no_services():
    df = make_sample_row()
    df = DataCleaner().transform(df)
    result = FeatureEngineer().transform(df)
    # All services are "No" → NoServices should be 1
    assert result["NoServices"].iloc[0] == 1


def test_get_feature_lists():
    df = make_sample_row()
    df = DataCleaner().transform(df)
    df = FeatureEngineer().transform(df)
    if "TotalCharges" in df.columns:
        df = df.drop(columns=["TotalCharges", "Churn"])
    num, bin_, cat = get_feature_lists(df)
    assert len(num) > 0
    assert len(cat) > 0
    assert "tenure" in num
    assert "Contract" in cat
