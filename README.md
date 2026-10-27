# 🏆 Telco Customer Churn Prediction System

> **Production-Ready · Business-Oriented · Anti-Overfitting · MLOps**

## 📋 Project Overview

End-to-end Machine Learning system for predicting customer churn in telecommunications, built with industrial best practices.

### Key Achievements
- ✅ **No data leakage** — all preprocessing inside sklearn Pipeline
- ✅ **Anti-overfitting** — constrained hyperparameters, regularization, early stopping
- ✅ **Robust validation** — Stratified K-Fold CV, nested CV, stability analysis
- ✅ **Business-optimized** — cost-based threshold tuning, ROI analysis
- ✅ **Production-ready** — FastAPI, Streamlit, Docker, monitoring
- ✅ **Interpretable** — SHAP explanations, feature importance, risk segmentation

## 🏗️ Architecture

```
churntele/
├── data/                          # Raw data
├── src/
│   ├── config.py                  # Central configuration
│   ├── preprocessing.py           # Leak-free sklearn Pipeline
│   ├── training.py                # Training, CV, tuning, calibration
│   ├── evaluation.py              # Metrics, plots, comparison
│   ├── inference.py               # Single/batch prediction
│   ├── monitoring.py              # PSI drift detection
│   └── utils.py                   # Helpers
├── models/                        # Saved pipelines
├── api/app.py                     # FastAPI REST API
├── streamlit_app/app.py           # Interactive dashboard
├── tests/                         # Unit tests
├── reports/                       # Generated reports & plots
├── run_training.py                # Main training script
├── requirements.txt
├── Dockerfile
└── README.md
```

## 🚀 Quick Start

### Installation
```bash
pip install -r requirements.txt
```

### Train the Model
```bash
python run_training.py
```
This runs the complete pipeline: data loading → cleaning → feature engineering → CV comparison → hyperparameter tuning → threshold optimization → calibration → stacking ensemble → model saving.

### Run Tests
```bash
pytest tests/ -v
```

### Start API
```bash
uvicorn api.app:app --host 0.0.0.0 --port 8000
```
API docs: http://localhost:8000/docs

### Start Dashboard
```bash
streamlit run streamlit_app/app.py
```

### Docker
```bash
docker build -t churn-predictor .
docker run -p 8000:8000 churn-predictor
```

## 📊 Models Used

| Model | Anti-Overfitting Strategy |
|-------|--------------------------|
| Logistic Regression | L1/L2 regularization, class_weight='balanced' |
| Random Forest | max_depth=10, min_samples_leaf=5, max_features='sqrt' |
| XGBoost | max_depth=5, gamma=1.0, reg_alpha/lambda, subsample=0.8 |
| LightGBM ⭐ | max_depth=7, num_leaves=31, reg_alpha/lambda, subsample=0.8 |
| CatBoost | depth=6, l2_leaf_reg=5, auto_class_weights='Balanced' |
| Stacking Ensemble | LR + RF + XGB + LGBM → LogisticRegression meta-learner, evaluated then rejected for production cost/benefit |

## 🎯 API Usage

### Predict Endpoint
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "tenure": 5,
    "MonthlyCharges": 70.0,
    "TotalCharges": 350.0,
    "gender": "Male",
    "SeniorCitizen": "No",
    "Partner": "No",
    "Dependents": "No",
    "PhoneService": "Yes",
    "MultipleLines": "No",
    "InternetService": "Fiber optic",
    "OnlineSecurity": "No",
    "OnlineBackup": "No",
    "DeviceProtection": "No",
    "TechSupport": "No",
    "StreamingTV": "No",
    "StreamingMovies": "No",
    "Contract": "Month-to-month",
    "PaperlessBilling": "Yes",
    "PaymentMethod": "Electronic check"
  }'
```

### Response
```json
{
  "churn_probability": 0.82,
  "will_churn": true,
  "risk_level": "CRITICAL",
  "recommendation": "Urgent escalation + premium retention package",
  "confidence": 0.85,
  "threshold_used": 0.42,
  "model_version": "2.0.0",
  "scored_at": "2026-05-16T23:00:00"
}
```

## 💰 Business Value

| Metric | Impact |
|--------|--------|
| **Churners caught** | ~80% of actual churners identified |
| **Cost per missed churner** | $500 (lost CLV) |
| **Cost per false alarm** | $50 (retention offer) |
| **Expected annual ROI** | 400-800% |
| **Retention success rate** | 30% (conservative) |

## 🔬 Scientific Rigor

### Data Leakage Prevention
- Train/test split BEFORE any preprocessing
- StandardScaler fitted on train only (inside Pipeline)
- OneHotEncoder fitted on train only (inside Pipeline)
- SMOTE applied inside CV folds only
- Calibration done with cross-validation on training data (NOT test)

### Validation Strategy
- Stratified K-Fold (5 folds) preserving class proportions
- Nested Cross-Validation for unbiased hyperparameter selection
- Mean ± std across folds for stability assessment
- Overfitting detection via train-test metric gaps

## 📈 Monitoring

- **PSI (Population Stability Index)** for data drift detection
- **Prediction drift** tracking for model degradation
- Automated alerts: PSI > 0.1 (monitor), PSI > 0.2 (retrain)

## 👤 Author

Built for PFE (Projet de Fin d'Études) — Data Science / ML Engineering

## 📄 License

MIT

---

## ChurnIQ AI Frontend

This project now includes a complete enterprise SaaS interface in `frontend/`.

### What Was Added

- React 19 + TypeScript + Vite frontend
- TailwindCSS design system using the ChurnIQ purple/white visual language
- Shadcn-style reusable UI components
- Framer Motion animations
- React Router pages for the full SaaS product
- React Query + Axios API integration
- TanStack Table customer management
- React Hook Form + Zod prediction form validation
- Recharts dashboards and analytics
- Static preview served by FastAPI at `/ui`
- Illustration placeholder assets in `frontend/public/assets/illustrations`
- RBAC roles, protected routes, command palette, dark mode and notification center
- Model performance, customer segmentation, AI copilot, model monitoring and reports index pages

### Run the Backend and UI Preview

```bash
uvicorn api.app:app --host 127.0.0.1 --port 8000
```

Open:

```text
http://127.0.0.1:8000/ui/preview.html
```

API docs:

```text
http://127.0.0.1:8000/docs
```

### Run the React App

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

## Production Readiness Notes

CHURNIQ AI now exposes a production-style FastAPI surface for the SaaS interface.

### Demo Credentials

```text
Email: zakaria@churniq.ai
Password: demo123
Role: Owner
```

### Backend Setup

```bash
pip install -r requirements.txt
uvicorn api.app:app --host 127.0.0.1 --port 8000
```

Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

Static SaaS preview:

```text
http://127.0.0.1:8000/ui/preview.html
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Optional environment variable:

```text
VITE_CHURN_API_URL=http://127.0.0.1:8000
```

### Production API Routes

Authentication:

```text
POST /auth/login
POST /auth/register
POST /auth/logout
```

Customers:

```text
GET    /customers
GET    /customers/{id}
POST   /customers
PUT    /customers/{id}
DELETE /customers/{id}
```

Predictions:

```text
POST /predict/single
POST /predict/batch
GET  /predictions/history
```

Explainability and Analytics:

```text
POST /shap/explain
GET  /analytics/dashboard
GET  /analytics/distributions
GET  /analytics/model-performance
```

Reports and Copilot:

```text
POST /reports/generate
GET  /reports
GET  /reports/{id}/download
POST /copilot/ask
```

Enterprise SaaS foundation:

```text
POST /campaigns
GET  /campaigns
GET  /notifications
POST /notifications/mark-all-read
GET  /audit-logs
GET  /settings
PUT  /settings
```

### Database

The backend uses a SQLite fallback database at:

```text
churniq.sqlite3
```

It is initialized automatically on API startup and contains:

```text
Users
Customers
Predictions
BatchJobs
Reports
Campaigns
Notifications
AuditLogs
Settings
```

The database is seeded from the Telco churn dataset for demo mode.

### Model Governance and Business Recommendation

CHURNIQ AI now separates the operational scoring artifact from the final business recommendation.

```text
Current scoring artifact: CatBoost
Technical ROC-AUC champion: CatBoost
Business recall champion: Logistic Regression + PowerTransformer
Rejected for deployment: Stacking, because complexity is not justified
```

This distinction matters because churn prediction is cost-sensitive. A false negative means the company misses a customer who is likely to churn, which can create direct revenue loss and customer lifetime value loss. A false positive is usually cheaper because a retention message, support call or discount has limited cost.

Latest benchmark summary:

| Model | ROC-AUC | Recall | F1 | Training Time | Interpretation |
|---|---:|---:|---:|---:|---|
| CatBoost | 0.8474 | 0.4866 | 0.5643 | 1.85 s | Technical ROC-AUC champion |
| Logistic Regression + PowerTransformer | 0.8471 | 0.7968 | 0.6234 | 0.37 s | Business champion for recall-first churn detection |
| Stacking + PowerTransformer | 0.8468 | 0.7620 | 0.6285 | 121.27 s | Rejected: high complexity with negligible ROC-AUC gain |

Model comparison remains available inside the model performance endpoints/pages. User-facing prediction workflows can still use the current scoring artifact, but dashboards and reports should explain the ROC-AUC vs recall tradeoff.

Class imbalance is handled explicitly:

```text
Logistic Regression: class_weight="balanced"
Random Forest: class_weight="balanced"
XGBoost: scale_pos_weight = negative / positive ratio
LightGBM: scale_pos_weight = negative / positive ratio
CatBoost: auto_class_weights="Balanced"
```

The evaluation also includes 5-fold stratified cross validation, overfitting mitigation, hyperparameter tuning, SHAP explainability and a stacking cost-benefit analysis.

### Verification Checklist

Use this quick manual QA flow before a presentation:

```text
1. Open /docs and verify API routes load.
2. Login with demo credentials.
3. Open dashboard and confirm metrics load.
4. Run POST /predict/single with the sample payload.
5. Run POST /predict/batch with two sample customers.
6. Generate a report with POST /reports/generate.
7. Download the generated report from /reports/{id}/download.
8. Ask Copilot: "How much revenue is at risk?"
9. Open /notifications and /audit-logs.
10. Open /ui/preview.html and test Ctrl+K, theme, exports and batch workflow.
```

The React app reads live project data from:

- `GET /dashboard-summary`
- `GET /customers-sample`
- `POST /predict`
- `GET /models`
- `GET /model-info`

### Real Manual Prediction Models

The interface now uses a real loadable model registry generated with:

```bash
py train_churniq_models.py
```

The registry is saved at `models/model_registry.pkl`, and the default loadable pipeline is also saved at `models/churn_pipeline.pkl`.
Manual prediction uses the server-side governed scoring artifact by default. Model comparison and alternative model discussion remain in the model performance and governance pages, not in the normal prediction workflow.

### Immediate Static Preview

If npm is unavailable:

```powershell
cd frontend
.\start-preview.ps1
```
