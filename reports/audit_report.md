# Rapport d'Audit â€” Customer Churn Prediction v3

**Date :** 2026-06-05  
**Projet :** `customer_churn_v3/customer_churn`  
**Objectif :** Cartographie complÃ¨te avant refactorisation acadÃ©mique (Early Stopping, Scaler Comparison, Dual Pipelines, Benchmark Global)

---

## Addendum 2026-06-12 - Updated Governance Decision

This audit report is preserved as historical project mapping. The final model recommendation has been reassessed using the latest benchmark and a churn-specific business cost perspective.

Updated interpretation:

- Current scoring artifact: CatBoost.
- Technical ROC-AUC champion: CatBoost, ROC-AUC = 0.8474.
- Business recall champion: Logistic Regression + PowerTransformer, Recall = 0.7968.
- Stacking is no longer recommended for production because its complexity and training time are not justified by the marginal AUC.

The older statement that `Stacking (meta=LR)` is the production model should be treated as historical, not the final recommendation.

---

## 1. Structure du Projet

```
customer_churn/
â”œâ”€â”€ api/app.py                    # API FastAPI
â”œâ”€â”€ streamlit_app/app.py          # Dashboard Streamlit
â”œâ”€â”€ data/                         # Dataset Telco
â”œâ”€â”€ models/                       # Artefacts (pkl, threshold_config.json)
â”œâ”€â”€ notebooks/EDA_analysis.ipynb  # EDA + modÃ©lisation exploratoire
â”œâ”€â”€ reports/                      # Rapports JSON/MD, plots SHAP
â”œâ”€â”€ src/                          # Code source principal
â”‚   â”œâ”€â”€ config.py                 # Configuration centralisÃ©e
â”‚   â”œâ”€â”€ preprocessing.py          # Nettoyage + Feature Engineering basique
â”‚   â”œâ”€â”€ feature_engineering.py    # Feature Engineering avancÃ© (v3)
â”‚   â”œâ”€â”€ training.py               # Pipeline v2
â”‚   â”œâ”€â”€ enhanced_training.py      # Pipeline v3 (Optuna, MLP Keras, Stacking)
â”‚   â”œâ”€â”€ deep_learning.py          # Keras MLP + Optuna
â”‚   â”œâ”€â”€ evaluation.py             # MÃ©triques et visualisations
â”‚   â”œâ”€â”€ overfitting_shap.py       # Overfitting + SHAP
â”‚   â”œâ”€â”€ inference.py              # PrÃ©diction production
â”‚   â””â”€â”€ monitoring.py             # PSI drift detection
â”œâ”€â”€ run_training.py               # Entry point v2
â”œâ”€â”€ run_enhanced_training.py      # Entry point v3
â””â”€â”€ tests/                        # Tests unitaires
```

---

## 2. ModÃ¨les IdentifiÃ©s

| ModÃ¨le | Fichier | Pipeline | Statut |
|--------|---------|----------|--------|
| LogisticRegression | `training.py:43`, `enhanced_training.py:418` | v2, v3 | âœ… Production |
| RandomForestClassifier | `training.py:46`, `enhanced_training.py:421` | v2, v3 | âœ… Production |
| XGBClassifier | `training.py:50`, `enhanced_training.py:425` | v2, v3 | âœ… Production |
| LGBMClassifier | `training.py:53`, `enhanced_training.py:431` | v2, v3 | âœ… Production |
| CatBoostClassifier | `training.py:56`, `enhanced_training.py:437` | v2, v3 | âœ… Production |
| KerasMLP (TensorFlow) | `deep_learning.py:160` | v3 uniquement | âœ… Production |
| StackingClassifier | `training.py:201`, `enhanced_training.py:284` | v2, v3 | âœ… Production |
| CalibratedClassifierCV | `training.py:340`, `enhanced_training.py:591` | v2, v3 | âœ… Production |
| KNeighborsClassifier | `EDA_analysis.ipynb` | Notebook | âš ï¸ Non production |
| SVM, Decision Tree, Extra Trees | â€” | Absents | âŒ Ã€ ajouter |
| MLPClassifier (sklearn) | â€” | Absent | âŒ Ã€ ajouter |

**Historique v3 :** `Stacking (meta=LR)` avait ete identifie dans ancien audit, mais la recommandation finale 2026-06-12 le rejette pour la production en raison du cout et de la complexite.
---

## 3. Preprocessors Existants

| Composant | Fichier | Usage |
|-----------|---------|-------|
| `DataCleaner` | `preprocessing.py:18` | Nettoyage ID, TotalCharges, SeniorCitizen |
| `FeatureEngineer` | `preprocessing.py:35` | 4 features basiques |
| `AdvancedFeatureEngineer` | `feature_engineering.py:20` | 6 features avancÃ©es (v3) |
| `StandardScaler` | `preprocessing.py:72`, `enhanced_training.py:117` | Colonnes numÃ©riques |
| `OneHotEncoder` | `preprocessing.py:73-74` | Binaires + catÃ©gorielles |
| `ColumnTransformer` | `preprocessing.py:68` | Assemblage preprocessors |
| `RFECV` | `enhanced_training.py:397` | SÃ©lection de features (v3) |

**Absents avant refactorisation :**
- `RobustScaler`, `PowerTransformer`
- `SimpleImputer` explicite
- `RFEMaskTransformer`, `TransformedWrapper` (rÃ©fÃ©rencÃ©s mais non dÃ©finis â€” bug)

---

## 4. Construction des Pipelines

### Pipeline v2 (`training.py`)
```python
Pipeline([("pre", preprocessor), ("clf", model)])
```
- Preprocessor : StandardScaler + OneHotEncoder
- 5 modÃ¨les baseline â†’ CV â†’ Tuning â†’ Calibration â†’ Stacking

### Pipeline v3 (`enhanced_training.py`)
```python
Pipeline([("pre", preprocessor), ("rfe", rfe_transformer), ("clf", clf)])
```
- Preprocessor avancÃ© + RFECV + Optuna + Stacking 6 modÃ¨les

### Notebook (`EDA_analysis.ipynb`)
- Pipelines multiples avec SMOTE, GridSearchCV, nested CV

---

## 5. Calcul des MÃ©triques

| Fonction | Fichier | MÃ©triques |
|----------|---------|-----------|
| `evaluate_single_model()` | `training.py:430` | Recall, Precision, F1, AUC, PR-AUC, Brier, Business Cost |
| `evaluate_model_full()` | `enhanced_training.py:128` | 8 mÃ©triques + overfitting gaps |
| `run_cross_validation()` | `training.py:62` | CV Recall, F1, ROC-AUC, PR-AUC |
| `compute_overfitting_report()` | `overfitting_shap.py:28` | Train/Test gaps + sÃ©vÃ©ritÃ© |
| `plot_model_evaluation()` | `evaluation.py:24` | Confusion matrix, ROC, PR curves |

---

## 6. Cross-Validation

| Emplacement | MÃ©thode | Folds | Scoring |
|-------------|---------|-------|---------|
| `training.py:62` | `cross_validate` + StratifiedKFold | 5 | recall, f1, roc_auc, pr_auc |
| `training.py:107` | RandomizedSearchCV | 5 | recall |
| `training.py:201` | StackingClassifier internal CV | 5 | â€” |
| `feature_engineering.py:119` | cross_val_score | 5 | roc_auc |
| `enhanced_training.py:397` | RFECV | 3 | roc_auc |
| `deep_learning.py:446-510` | Optuna manual CV loops | 3-5 | roc_auc |

**Gap identifiÃ© :** `enhanced_training.py` log "[5/12] CROSS VALIDATION" mais n'exÃ©cute pas de CV explicite sur les baselines.

---

## 7. Sauvegarde des RÃ©sultats

| Artefact | Chemin | Ã‰crit par |
|----------|--------|-----------|
| ModÃ¨le production | `models/churn_pipeline.pkl` | training.py, enhanced_training.py |
| Config seuil | `models/threshold_config.json` | training.py, enhanced_training.py |
| Rapport JSON | `reports/training_report.json` | training.py, enhanced_training.py |
| Rapport MD | `reports/training_report.md` | generate_report.py |
| SHAP plots | `reports/shap_*.png` | overfitting_shap.py |
| Comparaison modÃ¨les | `reports/model_comparison.png` | evaluation.py |

**Ã‰tat actuel :** `churn_pipeline.pkl` absent ; `threshold_config.json` et `training_report.json` prÃ©sents (v3, 2026-06-03).

---

## 8. Early Stopping â€” Ã‰tat Avant Modification

| ModÃ¨le | Early Stopping | DÃ©tails |
|--------|---------------|---------|
| Keras MLP | âœ… Oui | `EarlyStopping(patience=15)` dans `deep_learning.py:133` |
| XGBoost | âŒ Non | Optuna utilise eval_set sans early_stopping_rounds |
| LightGBM | âŒ Non | callbacks=[] dans Optuna |
| CatBoost | âŒ Non | Pas de od_type/od_wait |
| MLPClassifier | âŒ Non | Non utilisÃ© |

---

## 9. Bugs et IncohÃ©rences IdentifiÃ©s

1. **`RFEMaskTransformer`** rÃ©fÃ©rencÃ© ligne 410 de `enhanced_training.py` â€” classe non dÃ©finie
2. **`TransformedWrapper`** / **`TransformedWrapperMLP`** â€” classes non dÃ©finies
3. **Inference mismatch** â€” `inference.py` utilise FeatureEngineer basique, v3 utilise AdvancedFeatureEngineer
4. **ModÃ¨le pkl manquant** â€” API/Streamlit ne peuvent pas charger le modÃ¨le
5. **Pas de comparaison de scalers** â€” uniquement StandardScaler
6. **Pas de sÃ©paration PIPELINE_SCALE / PIPELINE_TREE**

---

## 10. DÃ©pendances

Fichier : `requirements.txt` â€” numpy, pandas, scikit-learn, xgboost, lightgbm, catboost, tensorflow, optuna, shap, imbalanced-learn, fastapi, streamlit, pytest.

---

## 11. Plan de Refactorisation

| Module | RÃ´le |
|--------|------|
| `src/transformers.py` | RFEMaskTransformer, wrappers MLP |
| `src/early_stopping.py` | Early stopping XGB/LGBM/CatBoost/MLP + courbes |
| `src/pipeline_builders.py` | PIPELINE_SCALE + PIPELINE_TREE |
| `src/metrics.py` | MÃ©triques unifiÃ©es + timing |
| `src/scaler_comparison.py` | Comparaison 3 scalers |
| `src/benchmark.py` | Benchmark global |
| `src/visualization.py` | Figures acadÃ©miques |
| `src/report_generator.py` | Analyses MD automatiques |
| `run_final_benchmark.py` | Orchestrateur final |

---

*Rapport gÃ©nÃ©rÃ© automatiquement â€” Phase 1 Audit complÃ¨te.*

