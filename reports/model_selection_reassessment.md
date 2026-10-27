# Model Selection Reassessment

## Purpose

This note reassesses the CHURNIQ AI model decision from both machine learning and business perspectives. It corrects the oversimplified narrative that a single model is automatically "best" because it has the highest ROC-AUC.

## Key Result

| Question | Answer |
|---|---|
| Highest ROC-AUC | CatBoost |
| Highest business recall among the compared champions | Logistic Regression with PowerTransformer |
| Best training efficiency | Logistic Regression |
| Best complexity-adjusted decision | Logistic Regression for recall-first churn operations |
| Rejected approach | Stacking, because complexity is not justified |

## CatBoost vs Logistic Regression

| Metric | CatBoost | Logistic Regression |
|---|---:|---:|
| ROC-AUC | 0.8474 | 0.8471 |
| Recall | 0.4866 | 0.7968 |
| Precision | 0.6716 | 0.5120 |
| F1 Score | 0.5643 | 0.6234 |
| CV Mean | 0.8442 | 0.8496 |
| CV Std | 0.0096 | 0.0119 |
| Training Time | 1.85 s | 0.37 s |

CatBoost is marginally stronger on ROC-AUC. Logistic Regression is dramatically stronger on recall. The ROC-AUC difference is about 0.0003, while the recall difference is about 31 percentage points.

## Why Recall Matters More in Churn Prediction

In churn prediction, false negatives are expensive:

- A false negative means a churner is missed.
- Missed churners create revenue loss.
- Missed churners also reduce customer lifetime value.
- The company loses the opportunity to intervene.

False positives are usually cheaper:

- A retention email or offer has limited cost.
- A support call can still improve customer experience.
- A loyal customer receiving an offer is less damaging than losing a customer silently.

Therefore, a model with slightly lower ROC-AUC but much higher recall can be the stronger business choice.

## Class Imbalance Handling

The dataset is imbalanced because churn customers are the minority class. The project handled imbalance explicitly:

| Model | Method |
|---|---|
| Logistic Regression | `class_weight="balanced"` |
| Random Forest | `class_weight="balanced"` |
| XGBoost | `scale_pos_weight = negative / positive ratio` |
| LightGBM | `scale_pos_weight = negative / positive ratio` |
| CatBoost | `auto_class_weights="Balanced"` |

This improves fairness toward the minority class and prevents the model from optimizing mainly for non-churn customers.

## Overfitting Mitigation

The project explored several robustness strategies:

- Regularization.
- Depth limitation.
- Minimum samples per leaf.
- Early stopping.
- Cross validation.
- Hyperparameter tuning.

These strategies demonstrate that the evaluation was not only a leaderboard exercise. The project checked whether models generalize and whether complex models add real value.

## Stacking Cost-Benefit Analysis

Stacking achieved approximately 0.8468 ROC-AUC, close to CatBoost and Logistic Regression. However, it required around 109 to 121 seconds of training in the observed runs, compared with about 1.85 seconds for CatBoost.

Conclusion:

- Performance gain is negligible.
- Training cost is much higher.
- Inference and monitoring are more complex.
- Explainability becomes harder.
- Operational risk increases.

Stacking should be rejected for deployment unless future data shows a clear and repeatable business advantage.

## Cross Validation and Stability

The project used stratified 5-fold cross validation. This is important because it keeps churn proportions stable across folds and reduces dependency on one train/test split.

The leading models show cross-validation standard deviation around 0.01, which means:

- Results are stable.
- Performance is reproducible.
- The comparison is not driven by chance.
- The methodology is credible for an academic defense.

## Recommended Dashboard Language

Use this wording in dashboards and executive summaries:

> Logistic Regression is the current production scoring model and the recall-first business champion. CatBoost remains a historical technical ROC-AUC benchmark, but churn false negatives are costly, so recall, business cost, threshold calibration and operational simplicity drive the production decision.

## Final Recommendation

For academic and business presentation:

- Present Logistic Regression as the **production scoring model** and **business champion**.
- Present CatBoost only as the **historical technical benchmark**.
- Present stacking as a **rejected high-complexity alternative**.
- Present the final model decision as a **governed tradeoff**, not a single-metric ranking.
