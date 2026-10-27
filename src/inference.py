"""
Inference Module — Production-Grade Single Customer Prediction
"""
import json
import logging
from datetime import datetime

import joblib
import numpy as np
import pandas as pd

from src.config import (
    MODEL_PATH, THRESHOLD_PATH,
    RISK_THRESHOLDS, RISK_RECOMMENDATIONS
)
# IMPORT DES TRANSFORMATEURS
from src.preprocessing import DataCleaner, FeatureEngineer

logger = logging.getLogger("churn_pipeline")

def classify_risk(probability: float) -> tuple:
    """Return (risk_level, recommendation) for a churn probability."""
    for level, (low, high) in RISK_THRESHOLDS.items():
        if low <= probability < high:
            return level.upper(), RISK_RECOMMENDATIONS[level]
    return "CRITICAL", RISK_RECOMMENDATIONS["critical"]

def predict_single(customer_data: dict, model=None, config=None) -> dict:
    """Score a single customer for churn risk with preprocessing."""
    if model is None:
        model = joblib.load(MODEL_PATH)
    if config is None:
        with open(THRESHOLD_PATH) as f:
            config = json.load(f)
    
    threshold = config.get("threshold", 0.5)
    
    # 1. Build DataFrame from customer data
    customer_df = pd.DataFrame([customer_data])
    
    # 2. APPLIQUER LE NETTOYAGE ET LE FEATURE ENGINEERING (Solution à l'erreur)
    try:
        cleaner = DataCleaner()
        engineer = FeatureEngineer()
        
        # On transforme les données brutes en données compréhensibles par le modèle
        customer_df = cleaner.transform(customer_df)
        customer_df = engineer.transform(customer_df)
        
        # Supprimer TotalCharges si le modèle a été entraîné sans
        if "TotalCharges" in customer_df.columns:
            customer_df = customer_df.drop(columns=["TotalCharges"])
            
    except Exception as e:
        logger.error(f"Preprocessing error: {e}")
        raise ValueError(f"Failed to preprocess input data: {e}")

    # 3. Predict probability
    # Le modèle reçoit maintenant les colonnes manquantes (NumServices, etc.)
    proba = model.predict_proba(customer_df)[:, 1][0]
    will_churn = proba >= threshold
    
    # Risk classification
    risk_level, recommendation = classify_risk(proba)
    
    # Confidence: distance from threshold
    confidence = abs(proba - threshold) / max(threshold, 1 - threshold)
    confidence = min(confidence, 1.0)
    
    result = {
        "churn_probability": round(float(proba), 4),
        "will_churn": bool(will_churn),
        "risk_level": risk_level,
        "recommendation": recommendation,
        "confidence": round(float(confidence), 4),
        "threshold_used": threshold,
        "model_version": config.get("version", "unknown"),
        "scored_at": datetime.now().isoformat(),
    }
    
    logger.info(
        f"PREDICTION | prob={proba:.4f} | risk={risk_level} | "
        f"churn={will_churn} | confidence={confidence:.4f}"
    )
    
    return result

def predict_batch(customers_df: pd.DataFrame, model=None, config=None) -> pd.DataFrame:
    """Score multiple customers. Returns DataFrame with predictions."""
    if model is None:
        model = joblib.load(MODEL_PATH)
    if config is None:
        with open(THRESHOLD_PATH) as f:
            config = json.load(f)
    
    threshold = config["threshold"]
    probas = model.predict_proba(customers_df)[:, 1]
    
    results = customers_df.copy()
    results["churn_probability"] = probas
    results["will_churn"] = probas >= threshold
    results["risk_level"] = [classify_risk(p)[0] for p in probas]
    results["recommendation"] = [classify_risk(p)[1] for p in probas]
    
    return results
