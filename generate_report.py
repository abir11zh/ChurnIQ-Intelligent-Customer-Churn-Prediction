import json
import argparse
from pathlib import Path

def generate_report(results_path, output_path):
    with open(results_path, "r") as f:
        report = json.load(f)

    md = [
        "# 📈 Telco Churn Prediction — Training Report",
        f"**Trained on:** `{report.get('trained_on', 'Unknown')}`",
        f"**Production Model:** `{report.get('best_model', 'Unknown')}`",
        f"**Optimal Threshold:** `{report.get('optimal_threshold', 0.5):.2f}`",
        "",
        "## 🏆 Model Comparison",
        "| Model | AUC-ROC | F1-Score | Recall | Precision | Status |",
        "|---|---|---|---|---|---|"
    ]

    for row in report.get("all_results", []):
        md.append(
            f"| {row.get('model', '')} | {row.get('test_auc_roc', 0):.4f} | "
            f"{row.get('test_f1', 0):.4f} | {row.get('test_recall', 0):.4f} | "
            f"{row.get('test_precision', 0):.4f} | {row.get('overfit_status', '')} |"
        )

    if report.get("feature_impact"):
        md.append("")
        md.append("## 🔬 Feature Impact Analysis")
        md.append("| Feature | Test AUC | AUC Delta | Recommendation |")
        md.append("|---|---|---|---|")
        for row in report.get("feature_impact", []):
             md.append(
                f"| {row.get('feature', '')} | {row.get('test_auc', 0):.4f} | "
                f"{row.get('delta', 0):+.4f} | {row.get('recommendation', '')} |"
             )

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=str, required=True)
    parser.add_argument("--output", type=str, required=True)
    args = parser.parse_args()
    generate_report(args.input, args.output)
    print(f"Report generated at {args.output}")
