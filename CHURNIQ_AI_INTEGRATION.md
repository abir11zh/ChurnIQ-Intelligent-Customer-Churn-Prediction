# ChurnIQ AI Integration

L'interface ChurnIQ AI a ete sauvegardee directement dans ce projet:

```text
C:\Users\DELL\Desktop\S2 master IAOC\Technique d'ia\customer_churn
```

## Fichiers principaux

- `frontend/` : application React/Vite complete et preview HTML.
- `frontend/preview.html` : interface demo ouvrable sans npm.
- `frontend/src/` : code React TypeScript.
- `frontend/public/assets/illustrations/` : placeholders des illustrations demandees.
- `api/app.py` : FastAPI avec endpoints ChurnIQ AI et preview servie via `/ui`.
- `README.md` : documentation mise a jour.
- `start_churniq_ai.ps1` : script pour lancer l'interface via FastAPI.

## Lancer l'interface

Depuis le dossier `customer_churn`:

```powershell
.\start_churniq_ai.ps1
```

Ou manuellement:

```bash
uvicorn api.app:app --host 127.0.0.1 --port 8000
```

Puis ouvrir:

```text
http://127.0.0.1:8000/ui/preview.html
```

## Endpoints ajoutes

- `GET /dashboard-summary`
- `GET /customers-sample`
- `POST /predict`
- `GET /models`
- `GET /model-info`
- `GET /model-performance`
- `GET /segmentation-summary`
- `GET /model-monitoring`
- `GET /reports-index`
- `POST /ai-copilot`
- `GET /ui/preview.html`

## Modules interface couverts

Landing, Login, Register, Forgot/Reset password, Protected app shell, RBAC roles,
Dashboard, Customer Management, Customer Details, Customer Segmentation,
Prediction Center, Single Prediction Wizard avec live risk, Prediction Result,
SHAP Explanation, Batch Prediction, Analytics Hub, Model Performance,
AI Insights, AI Copilot, Retention Center, Campaigns, Model Monitoring,
Reports, Notifications, Team, Profile, Settings, Help Center et Support.

## Note modele

Le fichier corrompu initial a ete remplace par un registre chargeable `models/model_registry.pkl`.
La prediction manuelle utilise maintenant de vrais pipelines entraines et permet de choisir:
CatBoost, LightGBM, XGBoost, Random Forest, Extra Trees, Decision Tree ou Logistic Regression.

Pour regenerer les modeles:

```powershell
py train_churniq_models.py
```
