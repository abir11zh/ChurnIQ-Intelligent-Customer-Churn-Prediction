"""
Deep Learning Module — MLP with TensorFlow/Keras + Optuna Optimization
=======================================================================
Implements two MLP architectures, Optuna-based hyperparameter search,
class-weight handling, early stopping, and sklearn-compatible wrapper.
"""
import os
import warnings
import logging

def log_phase(step:int,total:int,description:str):
    """Utility to log a progress line for pipeline phases."""
    logger.info(f"[{step}/{total}] {description}")

import numpy as np
import pandas as pd
from typing import Optional, Tuple, Dict, Any

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
warnings.filterwarnings("ignore")

import tensorflow as tf
from tensorflow import keras
tf.get_logger().setLevel('ERROR')
from tensorflow.keras import layers, regularizers
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from sklearn.base import BaseEstimator, ClassifierMixin
from sklearn.utils.class_weight import compute_class_weight
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import roc_auc_score
import optuna
optuna.logging.set_verbosity(optuna.logging.WARNING)

from src.config import RANDOM_STATE

logger = logging.getLogger("churn_pipeline")

tf.random.set_seed(RANDOM_STATE)
np.random.seed(RANDOM_STATE)


# ─── MLP Architecture Builders ──────────────────────────────────────────────

def build_mlp_v1(input_dim: int, dropout_rate: float = 0.3) -> keras.Model:
    """
    MLP Architecture 1 — Compact, fast, low-overfitting baseline.
    Dense(64) → Dropout → Dense(32) → Dropout → Dense(1)
    """
    model = keras.Sequential([
        layers.Input(shape=(input_dim,)),
        layers.Dense(64, activation="relu"),
        layers.Dropout(dropout_rate),
        layers.Dense(32, activation="relu"),
        layers.Dropout(dropout_rate),
        layers.Dense(1, activation="sigmoid"),
    ], name="MLP_v1")
    return model


def build_mlp_v2(input_dim: int, dropout_rate: float = 0.4) -> keras.Model:
    """
    MLP Architecture 2 — Optimized with He Normal, BN before Activation, Swish.
    Dense(128) → BN → Swish → Dropout → Dense(64) → BN → Swish → Dropout → Dense(32) → Swish → Dense(1)
    """
    init = keras.initializers.HeNormal(seed=RANDOM_STATE)
    model = keras.Sequential([
        layers.Input(shape=(input_dim,)),
        layers.Dense(128, kernel_initializer=init),
        layers.BatchNormalization(),
        layers.Activation("swish"),
        layers.Dropout(dropout_rate),
        layers.Dense(64, kernel_initializer=init),
        layers.BatchNormalization(),
        layers.Activation("swish"),
        layers.Dropout(0.3),
        layers.Dense(32, activation="swish", kernel_initializer=init),
        layers.Dense(1, activation="sigmoid"),
    ], name="MLP_v2")
    return model


def build_mlp_custom(
    input_dim: int,
    n_layers: int = 3,
    neurons: list = None,
    dropout_rate: float = 0.3,
    activation: str = "swish",
    l2_reg: float = 0.0,
    use_batch_norm: bool = True,
) -> keras.Model:
    """
    Flexible MLP builder for Optuna optimization.
    Supports variable depth, neuron counts, L2 regularization, and BatchNorm.
    Optimized with He Normal initialization and BN before activation.
    """
    if neurons is None:
        neurons = [128, 64, 32][:n_layers]

    init = keras.initializers.HeNormal(seed=RANDOM_STATE)
    inputs = layers.Input(shape=(input_dim,))
    x = inputs

    for i, n in enumerate(neurons[:n_layers]):
        x = layers.Dense(
            n,
            kernel_initializer=init,
            kernel_regularizer=regularizers.l2(l2_reg) if l2_reg > 0 else None,
        )(x)
        if use_batch_norm and i < n_layers - 1:
            x = layers.BatchNormalization()(x)
        x = layers.Activation(activation)(x)
        x = layers.Dropout(dropout_rate)(x)

    outputs = layers.Dense(1, activation="sigmoid")(x)
    return keras.Model(inputs, outputs, name="MLP_custom")


def get_callbacks(patience_es: int = 10, patience_lr: int = 5, total_epochs: int = 200, phase_desc: str = "Training") -> list:
    """Standard callbacks: EarlyStopping + ReduceLROnPlateau + TQDM EpochProgress."""
    from tqdm.keras import TqdmCallback

    # Use TqdmCallback for nice progress bars, and log less frequently
    class EpochProgressCallback(tf.keras.callbacks.Callback):
        def on_epoch_end(self, epoch, logs=None):
            logs = logs or {}
            loss = logs.get('loss')
            val_loss = logs.get('val_loss')
            # Log every 50 epochs to not pollute the terminal, rely on tqdm
            if (epoch + 1) % 50 == 0 or epoch == 0:
                logger.info(f"[{phase_desc}] Epoch {epoch+1}/{total_epochs} - loss: {loss:.4f} - val_loss: {val_loss:.4f}")

    return [
        EarlyStopping(
            monitor="val_loss",
            patience=patience_es,
            restore_best_weights=True,
            verbose=0,
        ),
        ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=patience_lr,
            min_lr=1e-6,
            verbose=0,
        ),
        TqdmCallback(verbose=0, desc=phase_desc),
        EpochProgressCallback(),
    ]


def compute_class_weights(y: np.ndarray) -> dict:
    """Compute balanced class weights to handle imbalanced datasets."""
    classes = np.unique(y)
    weights = compute_class_weight("balanced", classes=classes, y=y)
    return {int(c): float(w) for c, w in zip(classes, weights)}


# ─── Sklearn-Compatible MLP Wrapper ─────────────────────────────────────────

class KerasMLP(BaseEstimator, ClassifierMixin):
    """
    Sklearn-compatible wrapper for Keras MLP models.
    Supports predict_proba, fit, and cross-validation.
    Automatically handles class imbalance via class_weight.
    """

    def __init__(
        self,
        architecture: str = "v2",
        input_dim: int = None,
        n_layers: int = 3,
        neurons: list = None,
        dropout_rate: float = 0.35,
        learning_rate: float = 1e-3,
        batch_size: int = 64,
        epochs: int = 200,
        activation: str = "swish",
        l2_reg: float = 0.0,
        weight_decay: float = 1e-4,
        patience_es: int = 15,
        patience_lr: int = 7,
        use_class_weight: bool = True,
        validation_split: float = 0.15,
        random_state: int = RANDOM_STATE,
    ):
        self.architecture = architecture
        self.input_dim = input_dim
        self.n_layers = n_layers
        self.neurons = neurons
        self.dropout_rate = dropout_rate
        self.learning_rate = learning_rate
        self.batch_size = batch_size
        self.epochs = epochs
        self.activation = activation
        self.l2_reg = l2_reg
        self.weight_decay = weight_decay
        self.patience_es = patience_es
        self.patience_lr = patience_lr
        self.use_class_weight = use_class_weight
        self.validation_split = validation_split
        self.random_state = random_state
        self.model_ = None
        self.history_ = None
        self.classes_ = np.array([0, 1])

    def _build_model(self, input_dim: int) -> keras.Model:
        tf.random.set_seed(self.random_state)
        if self.architecture == "v1":
            model = build_mlp_v1(input_dim, self.dropout_rate)
        elif self.architecture == "v2":
            model = build_mlp_v2(input_dim, self.dropout_rate)
        else:  # custom
            model = build_mlp_custom(
                input_dim,
                n_layers=self.n_layers,
                neurons=self.neurons,
                dropout_rate=self.dropout_rate,
                activation=self.activation,
                l2_reg=self.l2_reg,
            )
        if hasattr(keras.optimizers, "AdamW"):
            opt = keras.optimizers.AdamW(learning_rate=self.learning_rate, weight_decay=self.weight_decay)
        else:
            opt = keras.optimizers.Adam(learning_rate=self.learning_rate)

        model.compile(
            optimizer=opt,
            loss="binary_crossentropy",
            metrics=[
                keras.metrics.AUC(name="auc"),
                keras.metrics.Precision(name="precision"),
                keras.metrics.Recall(name="recall"),
            ],
        )
        return model

    def fit(self, X, y):
        tf.random.set_seed(self.random_state)
        np.random.seed(self.random_state)

        if hasattr(X, "toarray"):
            X = X.toarray()
        X = np.array(X, dtype=np.float32)
        y = np.array(y, dtype=np.float32)

        input_dim = X.shape[1]
        self.model_ = self._build_model(input_dim)

        cw = compute_class_weights(y) if self.use_class_weight else None
        callbacks = get_callbacks(self.patience_es, self.patience_lr, self.epochs, f"MLP ({self.architecture}) Training")

        self.history_ = self.model_.fit(
            X, y,
            epochs=self.epochs,
            batch_size=self.batch_size,
            validation_split=self.validation_split,
            class_weight=cw,
            callbacks=callbacks,
            verbose=0,
        )
        return self

    def predict_proba(self, X):
        if hasattr(X, "toarray"):
            X = X.toarray()
        X = np.array(X, dtype=np.float32)
        proba = self.model_.predict(X, verbose=0).flatten()
        return np.column_stack([1 - proba, proba])

    def predict(self, X, threshold: float = 0.5):
        proba = self.predict_proba(X)[:, 1]
        return (proba >= threshold).astype(int)


# ─── Optuna MLP Optimization ────────────────────────────────────────────────

class MLPOptimizer:
    """
    Optuna-based hyperparameter optimization for the MLP.
    Optimizes: n_layers, neurons, dropout_rate, learning_rate,
               batch_size, activation, l2_regularization.
    Uses StratifiedKFold CV to estimate generalization performance.
    """

    def __init__(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        n_trials: int = 100,
        n_folds: int = 3,
        random_state: int = RANDOM_STATE,
    ):
        self.X_train = np.array(X_train, dtype=np.float32)
        self.y_train = np.array(y_train, dtype=np.float32)
        self.n_trials = n_trials
        self.n_folds = n_folds
        self.random_state = random_state
        self.best_params_: Optional[Dict[str, Any]] = None
        self.best_score_: float = 0.0
        self.study_: Optional[optuna.Study] = None

    def _objective(self, trial: optuna.Trial) -> float:
        """Single trial: build MLP with suggested params, evaluate via CV."""
        # Hyperparameter suggestions
        n_layers = trial.suggest_int("n_layers", 2, 4)
        neurons = [
            trial.suggest_categorical(f"neurons_l{i}", [32, 64, 128, 256])
            for i in range(n_layers)
        ]
        dropout_rate = trial.suggest_float("dropout_rate", 0.1, 0.5)
        learning_rate = trial.suggest_float("learning_rate", 1e-4, 5e-3, log=True)
        batch_size = trial.suggest_categorical("batch_size", [32, 64, 128])
        activation = trial.suggest_categorical("activation", ["relu", "elu", "swish"])
        l2_reg = trial.suggest_float("l2_reg", 1e-5, 1e-2, log=True)
        weight_decay = trial.suggest_float("weight_decay", 1e-5, 1e-2, log=True)

        skf = StratifiedKFold(
            n_splits=self.n_folds, shuffle=True, random_state=self.random_state
        )
        auc_scores = []

        for fold, (tr_idx, val_idx) in enumerate(
            skf.split(self.X_train, self.y_train)
        ):
            X_tr, X_val = self.X_train[tr_idx], self.X_train[val_idx]
            y_tr, y_val = self.y_train[tr_idx], self.y_train[val_idx]

            tf.random.set_seed(self.random_state + fold)
            model = build_mlp_custom(
                input_dim=X_tr.shape[1],
                n_layers=n_layers,
                neurons=neurons,
                dropout_rate=dropout_rate,
                activation=activation,
                l2_reg=l2_reg,
            )
            if hasattr(keras.optimizers, "AdamW"):
                opt = keras.optimizers.AdamW(learning_rate=learning_rate, weight_decay=weight_decay)
            else:
                opt = keras.optimizers.Adam(learning_rate=learning_rate)
                
            model.compile(
                optimizer=opt,
                loss="binary_crossentropy",
                metrics=["auc"],
            )
            cw = compute_class_weights(y_tr)
            callbacks = get_callbacks(patience_es=10, patience_lr=5, total_epochs=150, phase_desc=f"Optuna Trial {trial.number} (Fold {fold+1})")

            model.fit(
                X_tr, y_tr,
                epochs=150,
                batch_size=batch_size,
                validation_data=(X_val, y_val),
                class_weight=cw,
                callbacks=callbacks,
                verbose=0,
            )
            proba = model.predict(X_val, verbose=0).flatten()
            auc_scores.append(roc_auc_score(y_val, proba))
            keras.backend.clear_session()

        return float(np.mean(auc_scores))

    def optimize(self) -> Dict[str, Any]:
        """Run Optuna study and return best parameters."""
        logger.info(
            f"🔍 Starting MLP optimization: {self.n_trials} trials, "
            f"{self.n_folds}-fold CV"
        )
        sampler = optuna.samplers.TPESampler(seed=self.random_state)
        self.study_ = optuna.create_study(
            direction="maximize",
            sampler=sampler,
            study_name="mlp_optimization",
        )
        self.study_.optimize(
            self._objective,
            n_trials=self.n_trials,
            show_progress_bar=False,
        )
        self.best_params_ = self.study_.best_params
        self.best_score_ = self.study_.best_value
        logger.info(
            f"✅ MLP Optuna complete | Best CV AUC: {self.best_score_:.4f}"
        )
        logger.info(f"   Best params: {self.best_params_}")
        # Log phase completion for step 9/12 (MLP Optuna)
        logger.info("[9/12] MLP Optuna optimization completed")
        return self.best_params_

    def build_best_model(self) -> KerasMLP:
        """Instantiate a KerasMLP from the best Optuna parameters."""
        if self.best_params_ is None:
            raise RuntimeError("Call optimize() first.")
        p = self.best_params_
        n_layers = p["n_layers"]
        neurons = [p[f"neurons_l{i}"] for i in range(n_layers)]
        return KerasMLP(
            architecture="custom",
            n_layers=n_layers,
            neurons=neurons,
            dropout_rate=p["dropout_rate"],
            learning_rate=p["learning_rate"],
            batch_size=p["batch_size"],
            activation=p["activation"],
            l2_reg=p["l2_reg"],
            weight_decay=p.get("weight_decay", 1e-4),
            random_state=self.random_state,
        )


# ─── Optuna XGBoost Optimization ────────────────────────────────────────────

def optimize_xgboost(
    X_train: np.ndarray,
    y_train: np.ndarray,
    scale_pos_weight: float,
    n_trials: int = 100,
    n_folds: int = 5,
    random_state: int = RANDOM_STATE,
) -> Dict[str, Any]:
    """
    Optuna-based XGBoost optimization with StratifiedKFold.
    Replaces RandomizedSearchCV with intelligent Bayesian search.
    """
    from xgboost import XGBClassifier

    def objective(trial):
        params = {
            "max_depth": trial.suggest_int("max_depth", 3, 7),
            "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.2, log=True),
            "subsample": trial.suggest_float("subsample", 0.6, 1.0),
            "colsample_bytree": trial.suggest_float("colsample_bytree", 0.5, 1.0),
            "min_child_weight": trial.suggest_int("min_child_weight", 1, 15),
            "gamma": trial.suggest_float("gamma", 0.0, 3.0),
            "reg_alpha": trial.suggest_float("reg_alpha", 0.0, 3.0),
            "reg_lambda": trial.suggest_float("reg_lambda", 0.5, 3.0),
            "n_estimators": trial.suggest_int("n_estimators", 100, 600),
            "scale_pos_weight": scale_pos_weight,
            "eval_metric": "auc",
            "random_state": random_state,
            "n_jobs": -1,
            "verbosity": 0,
        }
        skf = StratifiedKFold(n_splits=n_folds, shuffle=True, random_state=random_state)
        scores = []
        for tr_idx, val_idx in skf.split(X_train, y_train):
            X_tr, X_val = X_train[tr_idx], X_train[val_idx]
            y_tr, y_val = y_train[tr_idx], y_train[val_idx]
            clf = XGBClassifier(**params)
            clf.fit(
                X_tr, y_tr,
                eval_set=[(X_val, y_val)],
                verbose=False,
            )
            scores.append(roc_auc_score(y_val, clf.predict_proba(X_val)[:, 1]))
        return float(np.mean(scores))

    logger.info(f"🔍 XGBoost Optuna: {n_trials} trials, {n_folds}-fold CV")
    study = optuna.create_study(
        direction="maximize",
        sampler=optuna.samplers.TPESampler(seed=random_state),
    )
    study.optimize(objective, n_trials=n_trials, show_progress_bar=False)
    best = study.best_params
    best.pop("scale_pos_weight", None)
    logger.info(f"✅ XGBoost Optuna complete | Best CV AUC: {study.best_value:.4f}")
    logger.info(f"   Best params: {best}")
    # Log phase completion for step 7/12 (XGBoost Optuna)
    logger.info("[7/12] XGBoost Optuna optimization completed")
    return best, study.best_value


# ─── Optuna LightGBM Optimization ───────────────────────────────────────────

def optimize_lightgbm(
    X_train: np.ndarray,
    y_train: np.ndarray,
    scale_pos_weight: float,
    n_trials: int = 100,
    n_folds: int = 5,
    random_state: int = RANDOM_STATE,
) -> Dict[str, Any]:
    """
    Optuna-based LightGBM optimization with StratifiedKFold.
    """
    from lightgbm import LGBMClassifier

    def objective(trial):
        params = {
            "num_leaves": trial.suggest_int("num_leaves", 15, 80),
            "max_depth": trial.suggest_int("max_depth", 3, 9),
            "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.2, log=True),
            "feature_fraction": trial.suggest_float("feature_fraction", 0.5, 1.0),
            "bagging_fraction": trial.suggest_float("bagging_fraction", 0.5, 1.0),
            "bagging_freq": trial.suggest_int("bagging_freq", 1, 7),
            "lambda_l1": trial.suggest_float("lambda_l1", 0.0, 3.0),
            "lambda_l2": trial.suggest_float("lambda_l2", 0.0, 3.0),
            "min_child_samples": trial.suggest_int("min_child_samples", 10, 60),
            "n_estimators": trial.suggest_int("n_estimators", 100, 600),
            "scale_pos_weight": scale_pos_weight,
            "random_state": random_state,
            "n_jobs": -1,
            "verbosity": -1,
        }
        skf = StratifiedKFold(n_splits=n_folds, shuffle=True, random_state=random_state)
        scores = []
        for tr_idx, val_idx in skf.split(X_train, y_train):
            X_tr, X_val = X_train[tr_idx], X_train[val_idx]
            y_tr, y_val = y_train[tr_idx], y_train[val_idx]
            from lightgbm import early_stopping as lgb_es, log_evaluation
            clf = LGBMClassifier(**params)
            clf.fit(
                X_tr, y_tr,
                eval_set=[(X_val, y_val)],
                callbacks=[lgb_es(100, verbose=False), log_evaluation(0)],
            )
            scores.append(roc_auc_score(y_val, clf.predict_proba(X_val)[:, 1]))
        return float(np.mean(scores))

    logger.info(f"🔍 LightGBM Optuna: {n_trials} trials, {n_folds}-fold CV")
    study = optuna.create_study(
        direction="maximize",
        sampler=optuna.samplers.TPESampler(seed=random_state),
    )
    study.optimize(objective, n_trials=n_trials, show_progress_bar=False)
    best = study.best_params
    logger.info(f"✅ LightGBM Optuna complete | Best CV AUC: {study.best_value:.4f}")
    logger.info(f"   Best params: {best}")
    # Log phase completion for step 8/12 (LightGBM Optuna)
    logger.info("[8/12] LightGBM Optuna optimization completed")
    return best, study.best_value
