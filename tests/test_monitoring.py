"""Tests for monitoring module."""
import pytest
import numpy as np
from src.monitoring import compute_psi


def test_psi_identical_distributions():
    data = np.random.normal(0, 1, 1000)
    psi = compute_psi(data, data)
    assert psi < 0.01  # Should be near zero


def test_psi_shifted_distribution():
    ref = np.random.normal(0, 1, 1000)
    shifted = np.random.normal(2, 1, 1000)  # Large shift
    psi = compute_psi(ref, shifted)
    assert psi > 0.2  # Should detect drift


def test_psi_returns_float():
    data = np.random.normal(0, 1, 100)
    result = compute_psi(data, data)
    assert isinstance(result, float)
