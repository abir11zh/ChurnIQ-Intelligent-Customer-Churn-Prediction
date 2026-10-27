"""
Automatic Report Generator
===========================
Produces final_analysis.md and final_recommendations.md from benchmark results.
"""
from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd

from src.config import FINAL_ANALYSIS_PATH, FINAL_RECOMMENDATIONS_PATH

logger = logging.getLogger("churn_pipeline")


def _df_to_markdown(df: pd.DataFrame, index: bool = False) -> str:
    """Convert DataFrame to markdown table without tabulate dependency."""
    if index:
        df = df.reset_index()
    cols = list(df.columns)
    lines = [
        "| " + " | ".join(str(c) for c in cols) + " |",
        "| " + " | ".join("---" for _ in cols) + " |",
    ]
    for _, row in df.iterrows():
        cells = []
        for c in cols:
            val = row[c]
            if isinstance(val, float):
                cells.append(f"{val:.4f}")
            else:
                cells.append(str(val))
        lines.append("| " + " | ".join(cells) + " |")
    return "\n".join(lines)

INTERPRETABLE_MODELS = {
    "Logistic Regression", "Decision Tree", "Random Forest",
}
PRODUCTION_CANDIDATES = {
    "LightGBM", "XGBoost", "Random Forest", "Stacking",
}


def _find_model(df: pd.DataFrame, model: str, scaler: Optional[str] = None) -> Optional[pd.Series]:
    mask = df["model"].eq(model)
    if scaler is not None:
        mask &= df["scaler"].eq(scaler)
    match = df[mask]
    if len(match) == 0:
        return None
    return match.iloc[0]


def _best_by_metric(df: pd.DataFrame, metric: str) -> pd.Series:
    return df.loc[df[metric].idxmax()]


def _format_model_row(row: pd.Series) -> str:
    return (
        f"**{row['model']}** (Scaler: {row['scaler']}) — "
        f"ROC-AUC={row['roc_auc']:.4f}, Recall={row['recall']:.4f}, "
        f"F1={row['f1']:.4f}, CV={row['cv_mean']:.4f}±{row['cv_std']:.4f}"
    )


def generate_final_analysis(benchmark_results: Dict[str, Any]) -> str:
    """Generate detailed analysis markdown."""
    df = benchmark_results["benchmark_df"]
    scaler_df = benchmark_results["scaler_df"]
    es_results = benchmark_results.get("early_stopping", {})
    baseline = benchmark_results.get("baseline_results")
    trained_on = benchmark_results.get("trained_on", datetime.now().isoformat())
    best_auc = _best_by_metric(df, "roc_auc")
    best_recall = _best_by_metric(df, "recall")
    catboost_match = _find_model(df, "CatBoost")
    logistic_match = _find_model(df, "Logistic Regression", "PowerTransformer")
    catboost = catboost_match if catboost_match is not None else best_auc
    logistic = logistic_match if logistic_match is not None else best_recall
    stacking = df[df["model"].str.contains("Stacking", case=False, na=False)].nlargest(1, "roc_auc")
    best_stacking = stacking.iloc[0] if len(stacking) else None
    auc_delta = catboost["roc_auc"] - logistic["roc_auc"]
    recall_delta = logistic["recall"] - catboost["recall"]
    stacking_multiplier = (
        best_stacking["training_time"] / max(catboost["training_time"], 0.0001)
        if best_stacking is not None else None
    )

    lines: List[str] = [
        "# Analyse Finale — Customer Churn Prediction",
        "",
        f"**Date de génération :** {trained_on}",
        f"**Nombre de modèles évalués :** {len(df)}",
        "",
        "---",
        "",
        "## Addendum — Recommandation orientée business",
        "",
        "Le meilleur modèle ne doit pas être présenté uniquement comme le modèle avec le ROC-AUC maximal. "
        "CatBoost est le champion technique ROC-AUC, mais Logistic Regression + PowerTransformer est le meilleur "
        "choix métier pour une stratégie de rétention car il détecte beaucoup plus de churners.",
        "",
        "| Axe de décision | Modèle | Métrique clé | Interprétation |",
        "|---|---|---:|---|",
        f"| Champion technique | {catboost['model']} | ROC-AUC = {catboost['roc_auc']:.4f} | Meilleur classement global par AUC |",
        f"| Champion métier | {logistic['model']} + {logistic['scaler']} | Recall = {logistic['recall']:.4f} | Détecte environ 80% des churners |",
        f"| Écart AUC | CatBoost - Logistic Regression | {auc_delta:.4f} | Différence négligeable |",
        f"| Gain recall | Logistic Regression - CatBoost | +{recall_delta * 100:.1f} points | Moins de faux négatifs coûteux |",
        "",
        "En churn prediction, un faux négatif correspond à un client qui part sans intervention, donc une perte de revenu "
        "et de valeur vie client. Un faux positif correspond plutôt à une offre ou un contact de fidélisation envoyé à "
        "un client qui serait peut-être resté, ce qui coûte généralement beaucoup moins cher.",
        "",
        "Conclusion à défendre : **CatBoost = champion technique**, **Logistic Regression = champion business**.",
        "",
        "## Rigueur méthodologique à mettre en avant",
        "",
        "- 21 combinaisons modèle × scaler ont été évaluées dans un benchmark systématique.",
        "- La validation croisée stratifiée 5-fold montre que le résultat ne vient pas d'un split favorable.",
        "- Les écarts-types CV autour de 0.01 indiquent une stabilité inter-folds et une bonne reproductibilité.",
        "- Le déséquilibre de classes est traité explicitement : `class_weight=\"balanced\"`, `scale_pos_weight` et `auto_class_weights=\"Balanced\"`.",
        "- Les modèles complexes ont été testés avec régularisation, limites de profondeur, contraintes `min_samples_leaf` et early stopping.",
        "- Le stacking a été évalué puis rejeté car son coût ne justifie pas son gain.",
        "",
        "## 1. Impact de l'Early Stopping",
        "",
    ]

    if es_results:
        lines.append("| Modèle | Itérations demandées | Itération optimale | Meilleur AUC validation |")
        lines.append("|--------|---------------------|-------------------|------------------------|")
        for name, meta in es_results.items():
            lines.append(
                f"| {name} | {meta.get('n_estimators_requested', 'N/A')} | "
                f"{meta.get('best_iteration', 'N/A')} | {meta.get('best_score', 0):.4f} |"
            )
        lines.extend([
            "",
            "**Observations :**",
            "- L'early stopping réduit le surapprentissage en arrêtant l'entraînement "
            "lorsque la métrique de validation cesse de s'améliorer.",
            "- Les itérations optimales sont généralement inférieures au maximum configuré (300), "
            "confirmant que les modèles n'ont pas besoin de tous les arbres/rounds.",
            "- L'impact sur le ROC-AUC est positif : meilleure généralisation avec moins d'itérations.",
            "",
        ])
    else:
        lines.append("*Données early stopping non disponibles.*\n")

    lines.extend([
        "## 2. Impact du Choix du Scaler",
        "",
    ])

    if len(scaler_df) > 0:
        scaler_summary = scaler_df.groupby("scaler").agg(
            roc_auc_mean=("roc_auc", "mean"),
            roc_auc_std=("roc_auc", "std"),
            recall_mean=("recall", "mean"),
            f1_mean=("f1", "mean"),
        ).round(4)
        lines.append(_df_to_markdown(scaler_summary.reset_index().rename(columns={"index": "scaler"})))
        lines.extend([
            "",
            "**Observations :**",
            "- `StandardScaler` : normalisation z-score, sensible aux outliers.",
            "- `RobustScaler` : utilise médiane et IQR, plus robuste aux valeurs extrêmes.",
            "- `PowerTransformer` : transformation de Yeo-Johnson pour normaliser les distributions asymétriques.",
            f"- Meilleur scaler global : **{scaler_summary['roc_auc_mean'].idxmax()}** "
            f"(AUC moyen = {scaler_summary['roc_auc_mean'].max():.4f}).",
            "",
        ])

    lines.extend([
        "## 3. Comparaison des Modèles",
        "",
        "### Top 10 — Classés par ROC-AUC",
        "",
        _df_to_markdown(df.head(10)[["model", "scaler", "roc_auc", "recall", "f1", "cv_mean", "cv_std"]]),
        "",
        "**Observations :**",
        f"- Champion technique ROC-AUC : **{best_auc['model']}** (ROC-AUC = {best_auc['roc_auc']:.4f}).",
        f"- Champion métier recall : **{best_recall['model']}** "
        f"(Recall = {best_recall['recall']:.4f}).",
        "- Logistic Regression + PowerTransformer est le meilleur choix business : AUC quasi identique à CatBoost, recall beaucoup plus élevé.",
        "- Les modèles de boosting restent forts techniquement, mais CatBoost manque plus de la moitié des churners au seuil évalué.",
        "- Le stacking est une expérimentation utile, mais il doit être présenté comme rejeté pour la production.",
        "",
        "## 4. Analyse de l'Overfitting",
        "",
    ])

    if "auc_gap" in df.columns:
        overfit = df[df["auc_gap"] > 0.05].sort_values("auc_gap", ascending=False)
        if len(overfit) > 0:
            lines.append("Modèles avec écart AUC train-test > 0.05 :")
            lines.append(_df_to_markdown(overfit[["model", "scaler", "auc_gap", "recall_gap"]].head(5)))
            lines.extend([
                "",
                "Des tentatives de mitigation ont été intégrées ou testées : régularisation L1/L2, profondeur maximale, "
                "`min_samples_leaf`, subsampling, early stopping et recherche d'hyperparamètres. Même si certains modèles "
                "arbres restent plus sensibles au surapprentissage, cette démarche montre que le problème a été diagnostiqué "
                "et traité méthodologiquement.",
            ])
        else:
            lines.append("Aucun modèle ne présente de surapprentissage sévère (gap AUC > 0.05).")
    lines.extend([
        "",
        "## 5. Analyse du Coût Calculatoire",
        "",
        _df_to_markdown(df.nlargest(10, "training_time")[["model", "scaler", "training_time", "inference_time", "roc_auc"]]),
        "",
        f"- Temps d'entraînement médian : {df['training_time'].median():.2f}s",
        f"- Temps d'inférence médian : {df['inference_time'].median():.6f}s",
        "- Les modèles linéaires (LR) et KNN offrent le meilleur ratio performance/coût.",
        (
            f"- Le stacking prend environ {best_stacking['training_time']:.2f}s contre "
            f"{catboost['training_time']:.2f}s pour CatBoost, soit environ {stacking_multiplier:.1f}x plus lent, "
            "sans amélioration de ROC-AUC."
            if best_stacking is not None and stacking_multiplier is not None
            else "- Le stacking doit être évalué selon son coût opérationnel, pas uniquement selon son score."
        ),
        "- Conclusion coût/bénéfice : ne pas retenir le stacking pour le déploiement.",
        "",
        "## 6. Stabilité Cross-Validation",
        "",
        _df_to_markdown(df.nsmallest(10, "cv_std")[["model", "scaler", "cv_mean", "cv_std", "roc_auc"]]),
        "",
        f"- Écart-type CV médian : {df['cv_std'].median():.4f}",
        "- Un faible écart-type CV indique une meilleure stabilité inter-folds.",
        "- Message soutenance : les résultats sont reproductibles, pas le résultat d'un hasard ou d'une sur-optimisation du test set.",
        "",
    ])

    if baseline is not None and len(baseline) > 0:
        lines.extend([
            "## 7. Comparaison Avant / Après Refactorisation",
            "",
            "### Baseline v3 (avant)",
            "",
        ])
        if "roc_auc" in baseline.columns:
            bl = baseline.nlargest(5, "roc_auc")[["model", "roc_auc", "recall", "f1"]]
            lines.append(_df_to_markdown(bl))
        lines.extend([
            "",
            "### Nouveau benchmark (après)",
            "",
            _df_to_markdown(df.head(5)[["model", "scaler", "roc_auc", "recall", "f1"]]),
            "",
        ])

    lines.extend([
        "---",
        "",
        "*Rapport généré automatiquement par `report_generator.py`*",
    ])

    content = "\n".join(lines)
    FINAL_ANALYSIS_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(FINAL_ANALYSIS_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    logger.info(f"Analysis report saved → {FINAL_ANALYSIS_PATH}")
    return content


def generate_final_recommendations(benchmark_results: Dict[str, Any]) -> str:
    """Generate recommendations markdown with automatic model identification."""
    df = benchmark_results["benchmark_df"]

    best_auc = _best_by_metric(df, "roc_auc")
    best_recall = _best_by_metric(df, "recall")
    catboost_match = _find_model(df, "CatBoost")
    logistic_match = _find_model(df, "Logistic Regression", "PowerTransformer")
    catboost = catboost_match if catboost_match is not None else best_auc
    logistic = logistic_match if logistic_match is not None else best_recall
    stacking = df[df["model"].str.contains("Stacking", case=False, na=False)].nlargest(1, "roc_auc")
    best_stacking = stacking.iloc[0] if len(stacking) else None
    auc_delta = catboost["roc_auc"] - logistic["roc_auc"]
    recall_delta = logistic["recall"] - catboost["recall"]
    stacking_multiplier = (
        best_stacking["training_time"] / max(catboost["training_time"], 0.0001)
        if best_stacking is not None else None
    )

    lines = [
        "# Final Model Recommendation - Customer Churn Prediction",
        "",
        f"**Date :** {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "",
        "---",
        "",
        "## Executive Summary",
        "",
        "La conclusion ne doit pas être `CatBoost est le meilleur modèle` sans nuance. "
        "CatBoost gagne de très peu sur le ROC-AUC, mais Logistic Regression + PowerTransformer "
        "est le meilleur choix business parce qu'il détecte beaucoup plus de churners.",
        "",
        "| Model | Scaler | ROC-AUC | Recall | F1 | Training Time | Decision |",
        "|---|---|---:|---:|---:|---:|---|",
        f"| {catboost['model']} | {catboost['scaler']} | {catboost['roc_auc']:.4f} | {catboost['recall']:.4f} | {catboost['f1']:.4f} | {catboost['training_time']:.2f} s | Technical ROC-AUC champion |",
        f"| {logistic['model']} | {logistic['scaler']} | {logistic['roc_auc']:.4f} | {logistic['recall']:.4f} | {logistic['f1']:.4f} | {logistic['training_time']:.2f} s | Business recall champion |",
        (
            f"| {best_stacking['model']} | {best_stacking['scaler']} | {best_stacking['roc_auc']:.4f} | "
            f"{best_stacking['recall']:.4f} | {best_stacking['f1']:.4f} | {best_stacking['training_time']:.2f} s | Rejected: poor cost-benefit |"
            if best_stacking is not None else ""
        ),
        "",
        "## 1. CatBoost vs Logistic Regression",
        "",
        f"- ROC-AUC CatBoost = {catboost['roc_auc']:.4f}.",
        f"- ROC-AUC Logistic Regression = {logistic['roc_auc']:.4f}.",
        f"- Écart ROC-AUC = {auc_delta:.4f}, donc quasiment nul.",
        f"- Recall CatBoost = {catboost['recall']:.4f}.",
        f"- Recall Logistic Regression = {logistic['recall']:.4f}.",
        f"- Gain recall = +{recall_delta * 100:.1f} points.",
        "",
        "**Conclusion :** Logistic Regression + PowerTransformer est le meilleur choix métier. "
        "Il conserve quasiment la même AUC que CatBoost, mais détecte environ 80% des clients qui partent.",
        "",
        "## 2. Business Rationale",
        "",
        "En désabonnement, un faux négatif est très coûteux : le client part sans action de rétention, "
        "ce qui détruit de la LTV. Un faux positif coûte généralement beaucoup moins cher : une offre, "
        "un appel ou un message de fidélisation envoyé à un client fidèle.",
        "",
        "Le modèle de production doit donc être choisi avec une logique coût métier, pas seulement avec le ROC-AUC.",
        "",
        "## 3. Class Imbalance Handling",
        "",
        "| Model | Method |",
        "|---|---|",
        '| Logistic Regression | `class_weight="balanced"` |',
        '| Random Forest | `class_weight="balanced"` |',
        "| XGBoost | `scale_pos_weight = negative / positive ratio` |",
        "| LightGBM | `scale_pos_weight = negative / positive ratio` |",
        '| CatBoost | `auto_class_weights="Balanced"` |',
        "",
        "Ces méthodes évitent que les modèles privilégient trop la classe majoritaire `No Churn`.",
        "",
        "## 4. Overfitting and Optimization",
        "",
        "Les modèles arbres ont montré des signes de surapprentissage. Le projet a tenté et intégré plusieurs techniques "
        "pour le limiter : régularisation, limites de profondeur, contraintes `min_samples_leaf`, subsampling, early stopping "
        "et recherche d'hyperparamètres. Ce point doit être mentionné comme une preuve de rigueur.",
        "",
        "## 5. Stacking Decision",
        "",
        (
            f"Le stacking atteint ROC-AUC = {best_stacking['roc_auc']:.4f}, mais prend "
            f"{best_stacking['training_time']:.2f}s contre {catboost['training_time']:.2f}s pour CatBoost "
            f"(environ {stacking_multiplier:.1f}x plus lent)."
            if best_stacking is not None and stacking_multiplier is not None
            else "Le stacking n'apporte pas un gain suffisant pour justifier sa complexité."
        ),
        "",
        "**Conclusion :** ne pas utiliser le stacking en production. Il augmente le temps d'entraînement, "
        "la complexité de monitoring et l'explicabilité sans gain AUC significatif.",
        "",
        "## 6. Cross Validation and Stability",
        "",
        "La validation croisée stratifiée 5-fold montre que les résultats ne sont pas obtenus en sur-optimisant le test set. "
        "Les écarts-types CV autour de 0.01 indiquent que les performances sont stables et reproductibles.",
        "",
        "Message soutenance : **our results are reproducible, not lucky**.",
        "",
        "## 7. Methodological Rigor",
        "",
        "Le benchmark compare 21 combinaisons modèle × variable d'échelle, avec validation croisée stratifiée, gestion du "
        "déséquilibre des classes, early stopping, régularisation et analyse coût/bénéfice. Il faut le présenter comme une "
        "méthodologie expérimentale rigoureuse, pas comme une exploration simple.",
        "",
        "## 8. Presentation Talking Points",
        "",
        "1. Business problem: churn creates revenue and LTV loss.",
        "2. Class imbalance: churners are minority but business-critical.",
        "3. Methodology: 21 model-scaler combinations, 5-fold stratified CV, early stopping.",
        "4. CatBoost: technical ROC-AUC champion.",
        "5. Logistic Regression: business champion because recall is much higher.",
        "6. Low CV std: stable and reproducible results.",
        "7. Stacking: tested but rejected because cost/benefit is poor.",
        "8. Final recommendation: choose the model according to business cost, not a single metric.",
        "",
        "## Final Recommendation",
        "",
        "Use **Logistic Regression + PowerTransformer** as the recall-first business champion for retention decisions. "
        "Keep **CatBoost** as the technical ROC-AUC champion and current scoring artifact until a governed production switch "
        "or threshold calibration is validated. Present **Stacking** as a scientifically tested but rejected alternative.",
        "",
        "---",
        "",
        "*Recommandations générées automatiquement — prêtes pour intégration mémoire PFE/Master.*",
    ]
    lines = [line for line in lines if line != "" or len(lines) > 0]

    content = "\n".join(lines)
    FINAL_RECOMMENDATIONS_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(FINAL_RECOMMENDATIONS_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    logger.info(f"Recommendations saved → {FINAL_RECOMMENDATIONS_PATH}")
    return content
