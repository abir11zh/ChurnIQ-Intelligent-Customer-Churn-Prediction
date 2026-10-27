# Telco Churn Prediction - Training and Governance Report

**Updated:** 2026-06-12

## Governance Summary

The final model decision is not a single-metric leaderboard. CatBoost has the highest ROC-AUC in the final benchmark, but Logistic Regression has much higher recall. Since churn false negatives are expensive, the project should present a business-aware recommendation.

| Role | Model | Reason |
|---|---|---|
| Current scoring artifact | CatBoost | Available production scoring pipeline and strongest ROC-AUC |
| Technical ROC-AUC champion | CatBoost | ROC-AUC = 0.8474 |
| Business recall champion | Logistic Regression + PowerTransformer | Recall = 0.7968 |
| Rejected high-complexity alternative | Stacking | Similar AUC with around 65x CatBoost training time |

## Model Comparison

| Model | Scaler | ROC-AUC | Recall | Precision | F1 | Training Time |
|---|---|---:|---:|---:|---:|---:|
| CatBoost | none | 0.8474 | 0.4866 | 0.6716 | 0.5643 | 1.85 s |
| Logistic Regression | PowerTransformer | 0.8471 | 0.7968 | 0.5120 | 0.6234 | 0.37 s |
| Stacking | PowerTransformer | 0.8468 | 0.7620 | 0.5350 | 0.6285 | 121.27 s |

## Business Interpretation

CatBoost and Logistic Regression have almost identical ROC-AUC. The difference is approximately 0.0003, which is negligible in practice.

The recall difference is much larger. Logistic Regression identifies about 31 percentage points more churners. In a retention workflow, this matters more than a tiny ROC-AUC difference because missing a churner prevents the business from intervening.

## Class Imbalance

The churn class is the minority class, so imbalance handling was used to improve detection capability:

| Model | Imbalance Strategy |
|---|---|
| Logistic Regression | `class_weight="balanced"` |
| Random Forest | `class_weight="balanced"` |
| XGBoost | `scale_pos_weight = negative / positive ratio` |
| LightGBM | `scale_pos_weight = negative / positive ratio` |
| CatBoost | `auto_class_weights="Balanced"` |

These choices make the comparison fairer and reduce the risk of models ignoring churners.

## Model Robustness

The project explored:

- Regularization.
- Depth limitation.
- Minimum samples per leaf.
- Early stopping.
- Hyperparameter tuning.
- Stratified 5-fold cross validation.

This strengthens the conclusion because the final recommendation is based on robustness, business utility and operational complexity, not only on test-set ranking.

## Cross Validation Stability

Leading models show cross-validation standard deviation close to 0.01. This indicates stable performance across folds and supports reproducibility.

## Stacking Decision

Stacking was rejected because it does not improve ROC-AUC over CatBoost or Logistic Regression while requiring much higher training time and operational complexity. It is less attractive for a production SaaS environment because it is harder to monitor, explain and maintain.

## Final Training Conclusion

The project should present:

- CatBoost as the technical ROC-AUC champion and current scoring artifact.
- Logistic Regression as the recall-first business champion.
- Stacking as a scientifically tested but rejected alternative.
- Stratified cross validation and class imbalance handling as evidence of methodological rigor.

The final production decision should include threshold calibration and real campaign cost validation before deployment.
