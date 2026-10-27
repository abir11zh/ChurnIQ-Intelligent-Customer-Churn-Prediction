"""
Global Benchmark Orchestrator
=============================
Runs full academic benchmark: early stopping, scaler comparison,
dual pipelines, global ranking, and artifact generation.
"""
from __future__ import annotations

import json
import logging
from copy import deepcopy
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.base import clone
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from src.config import (
    RANDOM_STATE,
    TEST_SIZE,
    FINAL_BENCHMARK_PATH,
    RESULTS_DIR,
    TRAINING_REPORT_PATH,
)
from src.early_stopping import run_early_stopping_analysis
from src.metrics import evaluate_with_timing, evaluate_prefitted, results_to_dataframe
from src.pipeline_builders import build_pipeline_scale, build_pipeline_tree
from src.preprocessing import load_and_clean_data
from src.scaler_comparison import run_scaler_comparison

logger = logging.getLogger("churn_pipeline")


def _fit_tree_with_early_stopping(
    pipe: Pipeline,
    X_train: pd.DataFrame,
    y_train: pd.Series,
    scale_pos_weight: float,
) -> Pipeline:
    """
    Fit tree boosting models with early stopping on preprocessed data.
    Non-boosting tree models use standard pipeline fit.
    """
    from src.early_stopping import (
        create_validation_split,
        fit_xgboost_with_early_stopping,
        fit_lightgbm_with_early_stopping,
        fit_catboost_with_early_stopping,
    )

    model_name = pipe.steps[-1][0]
    pre = pipe.named_steps["pre"]
    pre.fit(X_train, y_train)
    X_t = pre.transform(X_train)
    y_arr = y_train.values

    X_tr, X_val, y_tr, y_val = create_validation_split(X_t, y_arr)

    clf_template = pipe.named_steps["clf"]
    model_type = type(clf_template).__name__

    if "XGB" in model_type:
        fitted, _ = fit_xgboost_with_early_stopping(
            X_tr, y_tr, X_val, y_val,
            params={"n_estimators": clf_template.get_params().get("n_estimators", 300)},
            scale_pos_weight=scale_pos_weight,
        )
    elif "LGBM" in model_type:
        fitted, _ = fit_lightgbm_with_early_stopping(
            X_tr, y_tr, X_val, y_val,
            params={"n_estimators": clf_template.get_params().get("n_estimators", 300)},
            scale_pos_weight=scale_pos_weight,
        )
    elif "CatBoost" in model_type:
        fitted, _ = fit_catboost_with_early_stopping(
            X_tr, y_tr, X_val, y_val,
            params={"iterations": clf_template.get_params().get("iterations", 300)},
        )
    else:
        pipe.fit(X_train, y_train)
        return pipe

    return Pipeline([("pre", pre), ("clf", fitted)])


def run_tree_pipeline_benchmark(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    scale_pos_weight: float,
    use_early_stopping: bool = True,
) -> List[Dict[str, Any]]:
    """Evaluate all PIPELINE_TREE models."""
    results: List[Dict[str, Any]] = []
    pipelines = build_pipeline_tree(X_train, scale_pos_weight)

    boosting = {"XGBoost", "LightGBM", "CatBoost"}

    for name, pipe in pipelines.items():
        logger.info(f"  Training TREE: {name}...")
        try:
            import time as _time
            t0 = _time.perf_counter()
            if use_early_stopping and name in boosting:
                fitted = _fit_tree_with_early_stopping(pipe, X_train, y_train, scale_pos_weight)
            else:
                fitted = clone(pipe)
                fitted.fit(X_train, y_train)
            train_time = _time.perf_counter() - t0

            result = evaluate_prefitted(
                fitted,
                X_train, y_train, X_test, y_test,
                model_name=name,
                scaler="none",
                training_time=train_time,
            )
            result["fitted_model"] = fitted
            results.append(result)
        except Exception as exc:
            logger.error(f"  TREE {name} failed: {exc}")

    return results


def run_global_benchmark(
    fast_mode: bool = False,
    include_stacking: bool = True,
) -> Dict[str, Any]:
    """
    Execute the complete academic benchmark pipeline:
      1. Load & split data
      2. Early stopping analysis (boosting)
      3. Scaler comparison (PIPELINE_SCALE × 3 scalers)
      4. Tree pipeline benchmark (PIPELINE_TREE)
      5. Global ranking → final_benchmark.csv
    """
    logger.info("=" * 70)
    logger.info("  ACADEMIC BENCHMARK — Customer Churn Prediction")
    logger.info("=" * 70)

    # Load baseline results for before/after comparison
    baseline_results = _load_baseline_results()

    # 1. Data
    _, X, y = load_and_clean_data()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )
    spw = float((y_train == 0).sum() / (y_train == 1).sum())
    logger.info(f"Train={X_train.shape[0]} Test={X_test.shape[0]} SPW={spw:.3f}")

    # Preprocess for early stopping (tree preprocessor)
    from src.preprocessing import build_tree_preprocessor, get_feature_lists
    num_cols, bin_cols, cat_cols = get_feature_lists(X_train)
    tree_pre = build_tree_preprocessor(num_cols, bin_cols, cat_cols)
    tree_pre.fit(X_train)
    X_train_t = tree_pre.transform(X_train)

    # 2. Early stopping
    logger.info("\n[1/4] EARLY STOPPING ANALYSIS")
    es_results = run_early_stopping_analysis(
        X_train_t, y_train.values, scale_pos_weight=spw
    )

    # 3. Scaler comparison
    logger.info("\n[2/4] SCALER COMPARISON (PIPELINE_SCALE)")
    scaler_df = run_scaler_comparison(
        X_train, y_train, X_test, y_test,
        scale_pos_weight=spw,
        include_stacking=include_stacking and not fast_mode,
    )

    # 4. Tree pipeline
    logger.info("\n[3/4] TREE PIPELINE BENCHMARK (PIPELINE_TREE)")
    tree_results = run_tree_pipeline_benchmark(
        X_train, y_train, X_test, y_test,
        scale_pos_weight=spw,
        use_early_stopping=True,
    )

    # 5. Combine global benchmark
    logger.info("\n[4/4] GLOBAL BENCHMARK AGGREGATION")
    scale_results_raw = scaler_df.to_dict(orient="records")

    # Re-attach fitted models from scaler comparison (retrain best only later)
    all_flat: List[Dict[str, Any]] = []
    for row in scale_results_raw:
        all_flat.append(row)
    for row in tree_results:
        export_row = {k: v for k, v in row.items() if k not in ("fitted_model", "y_test_proba", "y_train_proba")}
        all_flat.append(export_row)

    benchmark_df = pd.DataFrame(all_flat).sort_values("roc_auc", ascending=False).reset_index(drop=True)
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    benchmark_df.to_csv(FINAL_BENCHMARK_PATH, index=False)
    logger.info(f"Global benchmark saved → {FINAL_BENCHMARK_PATH}")

    # Collect fitted models for visualization
    fitted_models: Dict[str, Any] = {}
    for r in tree_results:
        if "fitted_model" in r:
            fitted_models[r["model"]] = r["fitted_model"]

    # Best scale model per scaler for plots
    for scaler_label in scaler_df["scaler"].unique():
        sub = scaler_df[scaler_df["scaler"] == scaler_label]
        if len(sub) > 0:
            best = sub.iloc[0]
            key = f"{best['model']} ({scaler_label})"
            # Retrain best for plots
            scaler_key = {"StandardScaler": "standard", "RobustScaler": "robust",
                          "PowerTransformer": "power"}.get(scaler_label, "standard")
            pipes = build_pipeline_scale(X_train, spw, scaler_name=scaler_key, include_stacking=False)
            if best["model"] in pipes:
                m = clone(pipes[best["model"]])
                m.fit(X_train, y_train)
                fitted_models[key] = m

    return {
        "benchmark_df": benchmark_df,
        "scaler_df": scaler_df,
        "tree_results": tree_results,
        "early_stopping": es_results,
        "baseline_results": baseline_results,
        "fitted_models": fitted_models,
        "X_train": X_train,
        "X_test": X_test,
        "y_train": y_train,
        "y_test": y_test,
        "scale_pos_weight": spw,
        "trained_on": datetime.now().isoformat(),
    }


def _load_baseline_results() -> Optional[pd.DataFrame]:
    """Load previous training report for before/after comparison."""
    if not TRAINING_REPORT_PATH.exists():
        return None
    try:
        with open(TRAINING_REPORT_PATH, encoding="utf-8") as f:
            report = json.load(f)
        records = report.get("all_results", [])
        if not records:
            return None
        df = pd.DataFrame(records)
        df = df.rename(columns={
            "test_accuracy": "accuracy",
            "test_precision": "precision",
            "test_recall": "recall",
            "test_f1": "f1",
            "test_auc_roc": "roc_auc",
            "test_pr_auc": "pr_auc",
        })
        df["scaler"] = "StandardScaler (v3 baseline)"
        return df
    except Exception as exc:
        logger.warning(f"Could not load baseline: {exc}")
        return None
