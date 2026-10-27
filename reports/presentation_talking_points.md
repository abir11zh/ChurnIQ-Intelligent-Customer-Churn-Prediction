# Presentation Talking Points - Model Selection

## Message principal

Ne pas dire simplement : "CatBoost est le meilleur modele." Dire plutot :

> CatBoost est le champion technique ROC-AUC, mais Logistic Regression + PowerTransformer est le meilleur choix business car il detecte environ 80% des churners.

## Pourquoi Logistic Regression est le meilleur choix business

| Modele | ROC-AUC | Recall | Interpretation |
|---|---:|---:|---|
| CatBoost | 0.8474 | 0.4866 | Meilleur ROC-AUC, mais manque plus de la moitie des churners |
| Logistic Regression + PowerTransformer | 0.8471 | 0.7968 | Meme qualite AUC presque identique, beaucoup moins de faux negatifs |

L'ecart ROC-AUC est presque nul, mais le gain recall est d'environ +31 points. En churn, un faux negatif coute cher parce que le client part sans intervention. Un faux positif coute moins cher parce qu'une offre ou un contact de retention reste limite.

## Desequilibre des classes

Mettre en avant que le projet traite le desequilibre explicitement :

- Logistic Regression : `class_weight="balanced"`
- Random Forest : `class_weight="balanced"`
- XGBoost : `scale_pos_weight = negative / positive ratio`
- LightGBM : `scale_pos_weight = negative / positive ratio`
- CatBoost : `auto_class_weights="Balanced"`

## Overfitting

Dire que le probleme a ete identifie et que plusieurs techniques ont ete tentees ou integrees :

- Regularisation L1/L2.
- Limites de profondeur.
- Contraintes `min_samples_leaf`.
- Subsampling.
- Early stopping.
- Hyperparameter tuning.

## Stacking

Le stacking est rejete pour la production :

- ROC-AUC proche : environ 0.8468.
- Temps d'entrainement beaucoup plus eleve : 109 a 121 secondes.
- CatBoost atteint 0.8474 en environ 1.85 seconde.
- Complexite superieure : monitoring, inference, maintenance et explicabilite.

Conclusion orale : "Stacking was tested, but the cost-benefit ratio is not justified."

## Cross-validation et stabilite

Insister sur la rigueur :

- 21 combinaisons modele x scaler.
- Validation croisee stratifiee 5-fold.
- Early stopping pour les modeles boosting.
- Gestion du desequilibre de classes.
- CV std autour de 0.01.

Phrase utile : "Our results are reproducible, not lucky."

## Conclusion finale

La decision finale est une decision gouvernee :

- CatBoost : champion technique ROC-AUC.
- Logistic Regression + PowerTransformer : champion business recall-first.
- Stacking : alternative testee puis rejetee.
- Le choix de production doit prioriser le cout metier des faux negatifs.
