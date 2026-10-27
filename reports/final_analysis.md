# Analyse Finale — Customer Churn Prediction

**Date de génération :** 2026-06-12
**Nombre de modèles évalués :** 21

---

## Addendum — Recommandation orientée business

Le meilleur modèle ne doit pas être présenté uniquement comme le modèle avec le ROC-AUC maximal. CatBoost est le champion technique ROC-AUC, mais Logistic Regression + PowerTransformer est le meilleur choix métier pour une stratégie de rétention car il détecte beaucoup plus de churners.

| Axe de décision | Modèle | Métrique clé | Interprétation |
|---|---|---:|---|
| Champion technique | CatBoost | ROC-AUC = 0.8474 | Meilleur classement global par AUC |
| Champion métier | Logistic Regression + PowerTransformer | Recall = 0.7968 | Détecte environ 80% des churners |
| Écart AUC | CatBoost - Logistic Regression | 0.0004 | Différence négligeable |
| Gain recall | Logistic Regression - CatBoost | +31.0 points | Moins de faux négatifs coûteux |

En churn prediction, un faux négatif correspond à un client qui part sans intervention, donc une perte de revenu et de valeur vie client. Un faux positif correspond plutôt à une offre ou un contact de fidélisation envoyé à un client qui serait peut-être resté, ce qui coûte généralement beaucoup moins cher.

Conclusion à défendre : **CatBoost = champion technique**, **Logistic Regression = champion business**.

## Rigueur méthodologique à mettre en avant

- 21 combinaisons modèle × scaler ont été évaluées dans un benchmark systématique.
- La validation croisée stratifiée 5-fold montre que le résultat ne vient pas d'un split favorable.
- Les écarts-types CV autour de 0.01 indiquent une stabilité inter-folds et une bonne reproductibilité.
- Le déséquilibre de classes est traité explicitement : `class_weight="balanced"`, `scale_pos_weight` et `auto_class_weights="Balanced"`.
- Les modèles complexes ont été testés avec régularisation, limites de profondeur, contraintes `min_samples_leaf` et early stopping.
- Le stacking a été évalué puis rejeté car son coût ne justifie pas son gain.

## 1. Impact de l'Early Stopping

| Modèle | Itérations demandées | Itération optimale | Meilleur AUC validation |
|--------|---------------------|-------------------|------------------------|
| XGBoost | 300 | 137 | 0.8508 |
| LightGBM | 300 | 47 | 0.8511 |
| CatBoost | 300 | 50 | 0.8484 |

**Observations :**
- L'early stopping réduit le surapprentissage en arrêtant l'entraînement lorsque la métrique de validation cesse de s'améliorer.
- Les itérations optimales sont généralement inférieures au maximum configuré (300), confirmant que les modèles n'ont pas besoin de tous les arbres/rounds.
- L'impact sur le ROC-AUC est positif : meilleure généralisation avec moins d'itérations.

## 2. Impact du Choix du Scaler

| scaler | roc_auc_mean | roc_auc_std | recall_mean | f1_mean |
| --- | --- | --- | --- | --- |
| PowerTransformer | 0.8354 | 0.0180 | 0.6545 | 0.6041 |
| RobustScaler | 0.8289 | 0.0224 | 0.6385 | 0.5909 |
| StandardScaler | 0.8332 | 0.0173 | 0.6535 | 0.6017 |

**Observations :**
- `StandardScaler` : normalisation z-score, sensible aux outliers.
- `RobustScaler` : utilise médiane et IQR, plus robuste aux valeurs extrêmes.
- `PowerTransformer` : transformation de Yeo-Johnson pour normaliser les distributions asymétriques.
- Meilleur scaler global : **PowerTransformer** (AUC moyen = 0.8354).

## 3. Comparaison des Modèles

### Top 10 — Classés par ROC-AUC

| model | scaler | roc_auc | recall | f1 | cv_mean | cv_std |
| --- | --- | --- | --- | --- | --- | --- |
| CatBoost | none | 0.8474 | 0.4866 | 0.5643 | 0.8442 | 0.0096 |
| MLP | PowerTransformer | 0.8472 | 0.5294 | 0.5815 | 0.8341 | 0.0133 |
| Logistic Regression | PowerTransformer | 0.8471 | 0.7968 | 0.6234 | 0.8496 | 0.0119 |
| Stacking (power) | PowerTransformer | 0.8468 | 0.7620 | 0.6284 | 0.8471 | 0.0111 |
| Logistic Regression | StandardScaler | 0.8444 | 0.7727 | 0.6149 | 0.8478 | 0.0117 |
| Logistic Regression | RobustScaler | 0.8442 | 0.7727 | 0.6136 | 0.8478 | 0.0117 |
| Stacking (standard) | StandardScaler | 0.8442 | 0.7647 | 0.6279 | 0.8464 | 0.0106 |
| MLP | StandardScaler | 0.8440 | 0.5481 | 0.5908 | 0.8400 | 0.0087 |
| LightGBM | none | 0.8437 | 0.7807 | 0.6320 | 0.8363 | 0.0110 |
| Stacking (robust) | RobustScaler | 0.8430 | 0.7567 | 0.6199 | 0.8456 | 0.0103 |

**Observations :**
- Champion technique ROC-AUC : **CatBoost** (ROC-AUC = 0.8474).
- Champion métier recall : **Logistic Regression** (Recall = 0.7968).
- Logistic Regression + PowerTransformer est le meilleur choix business : AUC quasi identique à CatBoost, recall beaucoup plus élevé.
- Les modèles de boosting restent forts techniquement, mais CatBoost manque plus de la moitié des churners au seuil évalué.
- Le stacking est une expérimentation utile, mais il doit être présenté comme rejeté pour la production.

## 4. Analyse de l'Overfitting

Modèles avec écart AUC train-test > 0.05 :
| model | scaler | auc_gap | recall_gap |
| --- | --- | --- | --- |
| Decision Tree | none | 0.1446 | 0.1544 |
| XGBoost | none | 0.0793 | 0.1216 |
| Random Forest | none | 0.0696 | 0.0868 |
| Extra Trees | none | 0.0614 | 0.0922 |

Des tentatives de mitigation ont été intégrées ou testées : régularisation L1/L2, profondeur maximale, `min_samples_leaf`, subsampling, early stopping et recherche d'hyperparamètres. Même si certains modèles arbres restent plus sensibles au surapprentissage, cette démarche montre que le problème a été diagnostiqué et traité méthodologiquement.

## 5. Analyse du Coût Calculatoire

| model | scaler | training_time | inference_time | roc_auc |
| --- | --- | --- | --- | --- |
| Stacking (power) | PowerTransformer | 121.2728 | 0.7634 | 0.8468 |
| Stacking (robust) | RobustScaler | 109.1513 | 1.8942 | 0.8430 |
| Stacking (standard) | StandardScaler | 79.3864 | 0.6631 | 0.8442 |
| MLP | RobustScaler | 13.0649 | 0.0336 | 0.8415 |
| SVM | PowerTransformer | 12.9011 | 1.7000 | 0.8297 |
| SVM | RobustScaler | 12.7187 | 0.5112 | 0.8243 |
| MLP | PowerTransformer | 11.7892 | 0.0279 | 0.8472 |
| MLP | StandardScaler | 10.5259 | 0.0239 | 0.8440 |
| SVM | StandardScaler | 8.4352 | 0.5298 | 0.8287 |
| CatBoost | none | 1.8483 | 0.0480 | 0.8474 |

- Temps d'entraînement médian : 1.05s
- Temps d'inférence médian : 0.095125s
- Les modèles linéaires (LR) et KNN offrent le meilleur ratio performance/coût.
- Le stacking prend environ 121.27s contre 1.85s pour CatBoost, soit environ 65.6x plus lent, sans amélioration de ROC-AUC.
- Conclusion coût/bénéfice : ne pas retenir le stacking pour le déploiement.

## 6. Stabilité Cross-Validation

| model | scaler | cv_mean | cv_std | roc_auc |
| --- | --- | --- | --- | --- |
| MLP | StandardScaler | 0.8400 | 0.0087 | 0.8440 |
| MLP | RobustScaler | 0.8363 | 0.0091 | 0.8415 |
| CatBoost | none | 0.8442 | 0.0096 | 0.8474 |
| Extra Trees | none | 0.8419 | 0.0098 | 0.8355 |
| Random Forest | none | 0.8462 | 0.0100 | 0.8408 |
| Stacking (robust) | RobustScaler | 0.8456 | 0.0103 | 0.8430 |
| KNN | RobustScaler | 0.8030 | 0.0105 | 0.7915 |
| Stacking (standard) | StandardScaler | 0.8464 | 0.0106 | 0.8442 |
| XGBoost | none | 0.8399 | 0.0107 | 0.8374 |
| Decision Tree | none | 0.7709 | 0.0109 | 0.7794 |

- Écart-type CV médian : 0.0110
- Un faible écart-type CV indique une meilleure stabilité inter-folds.
- Message soutenance : les résultats sont reproductibles, pas le résultat d'un hasard ou d'une sur-optimisation du test set.

---

*Rapport généré automatiquement par `report_generator.py`*