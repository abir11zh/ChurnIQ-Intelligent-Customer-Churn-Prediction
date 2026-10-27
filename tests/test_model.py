"""Tests for model inference."""
import pytest
import numpy as np
from src.inference import classify_risk


def test_classify_risk_low():
    level, rec = classify_risk(0.15)
    assert level == "LOW"


def test_classify_risk_medium():
    level, rec = classify_risk(0.4)
    assert level == "MEDIUM"


def test_classify_risk_high():
    level, rec = classify_risk(0.6)
    assert level == "HIGH"


def test_classify_risk_critical():
    level, rec = classify_risk(0.85)
    assert level == "CRITICAL"


def test_classify_risk_edge_cases():
    level, _ = classify_risk(0.0)
    assert level == "LOW"
    level, _ = classify_risk(0.3)
    assert level == "MEDIUM"
    level, _ = classify_risk(0.7)
    assert level == "CRITICAL"
