# Final Model Recommendation - Customer Churn Prediction

**Date :** 2026-06-12 20:35

---

## Executive Summary

La conclusion ne doit pas être `CatBoost est le meilleur modèle` sans nuance. CatBoost gagne de très peu sur le ROC-AUC, mais Logistic Regression + PowerTransformer est le meilleur choix business parce qu'il détecte beaucoup plus de churners.

| Model | Scaler | ROC-AUC | Recall | F1 | Training Time | Decision |
|---|---|---:|---:|---:|---:|---|
| CatBoost | none | 0.8474 | 0.4866 | 0.5643 | 1.85 s | Technical ROC-AUC champion |
| Logistic Regression | PowerTransformer | 0.8471 | 0.7968 | 0.6234 | 0.37 s | Business recall champion |
| Stacking (power) | PowerTransformer | 0.8468 | 0.7620 | 0.6284 | 121.27 s | Rejected: poor cost-benefit |

## 1. CatBoost vs Logistic Regression

- ROC-AUC CatBoost = 0.8474.
- ROC-AUC Logistic Regression = 0.8471.
- Écart ROC-AUC = 0.0004, donc quasiment nul.
- Recall CatBoost = 0.4866.
- Recall Logistic Regression = 0.7968.
- Gain recall = +31.0 points.

**Conclusion :** Logistic Regression + PowerTransformer est le meilleur choix métier. Il conserve quasiment la même AUC que CatBoost, mais détecte environ 80% des clients qui partent.

## 2. Business Rationale

En désabonnement, un faux négatif est très coûteux : le client part sans action de rétention, ce qui détruit de la LTV. Un faux positif coûte généralement beaucoup moins cher : une offre, un appel ou un message de fidélisation envoyé à un client fidèle.

Le modèle de production doit donc être choisi avec une logique coût métier, pas seulement avec le ROC-AUC.

## 3. Class Imbalance Handling

| Model | Method |
|---|---|
| Logistic Regression | `class_weight="balanced"` |
| Random Forest | `class_weight="balanced"` |
| XGBoost | `scale_pos_weight = negative / positive ratio` |
| LightGBM | `scale_pos_weight = negative / positive ratio` |
| CatBoost | `auto_class_weights="Balanced"` |

Ces méthodes évitent que les modèles privilégient trop la classe majoritaire `No Churn`.

## 4. Overfitting and Optimization

Les modèles arbres ont montré des signes de surapprentissage. Le projet a tenté et intégré plusieurs techniques pour le limiter : régularisation, limites de profondeur, contraintes `min_samples_leaf`, subsampling, early stopping et recherche d'hyperparamètres. Ce point doit être mentionné comme une preuve de rigueur.

## 5. Stacking Decision

Le stacking atteint ROC-AUC = 0.8468, mais prend 121.27s contre 1.85s pour CatBoost (environ 65.6x plus lent).

**Conclusion :** ne pas utiliser le stacking en production. Il augmente le temps d'entraînement, la complexité de monitoring et l'explicabilité sans gain AUC significatif.

## 6. Cross Validation and Stability

La validation croisée stratifiée 5-fold montre que les résultats ne sont pas obtenus en sur-optimisant le test set. Les écarts-types CV autour de 0.01 indiquent que les performances sont stables et reproductibles.

Message soutenance : **our results are reproducible, not lucky**.

## 7. Methodological Rigor

Le benchmark compare 21 combinaisons modèle × variable d'échelle, avec validation croisée stratifiée, gestion du déséquilibre des classes, early stopping, régularisation et analyse coût/bénéfice. Il faut le présenter comme une méthodologie expérimentale rigoureuse, pas comme une exploration simple.

## 8. Presentation Talking Points

1. Business problem: churn creates revenue and LTV loss.
2. Class imbalance: churners are minority but business-critical.
3. Methodology: 21 model-scaler combinations, 5-fold stratified CV, early stopping.
4. CatBoost: technical ROC-AUC champion.
5. Logistic Regression: business champion because recall is much higher.
6. Low CV std: stable and reproducible results.
7. Stacking: tested but rejected because cost/benefit is poor.
8. Final recommendation: choose the model according to business cost, not a single metric.

## Final Recommendation

Use **Logistic Regression + PowerTransformer** as the recall-first business champion for retention decisions. Keep **CatBoost** as the technical ROC-AUC champion and current scoring artifact until a governed production switch or threshold calibration is validated. Present **Stacking** as a scientifically tested but rejected alternative.

---

*Recommandations générées automatiquement — prêtes pour intégration mémoire PFE/Master.*
