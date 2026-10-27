# ChurnIQ AI

Frontend SaaS premium pour une plateforme de prediction du churn client.

## Contenu

- Application React 19 + TypeScript + Vite
- Tailwind CSS avec design system violet/blanc inspire des maquettes ChurnIQ
- Composants style Shadcn/UI
- Animations Framer Motion
- Routes React Router avec protection d'application
- Donnees factices, KPI, tableaux et graphiques Recharts
- Client Axios pret pour l'API FastAPI du projet ML existant
- RBAC local Admin / Manager / Analyst / Viewer
- Command palette Ctrl+K, dark mode et notification center
- Preview HTML autonome pour ouvrir la demo meme sans npm

## Lancer la preview immediate

Depuis ce dossier:

```powershell
.\start-preview.ps1
```

Puis ouvrir:

```text
http://127.0.0.1:4173/preview.html
```

La preview contient plus de 25 vues cliquables: landing, login, register, forgot/reset password, dashboard, customers, customer details, segmentation, prediction, result, SHAP, batch, analytics, model performance, insights, copilot, retention, campaigns, model monitoring, reports, notifications, team, profile, settings, help et support.

## Lancer l'application React

Quand Node.js et npm sont disponibles:

```bash
npm install
npm run dev
```

Ouvrir ensuite:

```text
http://127.0.0.1:5173
```

## API FastAPI

Le client Axios pointe par defaut vers:

```text
http://127.0.0.1:8000
```

Pour changer l'URL:

```bash
VITE_CHURN_API_URL=http://127.0.0.1:8000 npm run dev
```

## Integration avec le projet ML

Cette interface fait partie du projet `customer_churn` et consomme les endpoints ajoutes dans `api/app.py`:

- `GET /dashboard-summary` pour les KPI calcules depuis `data/WA_Fn-UseC_-Telco-Customer-Churn.csv`
- `GET /customers-sample` pour la table TanStack des clients
- `POST /predict` pour la prediction individuelle reelle avec choix du modele
- `GET /models` pour lister les modeles entraines disponibles dans `model_registry.pkl`
- `GET /model-info` pour la version du modele, seuil et metriques
- `GET /model-performance` pour le leaderboard ML, les metriques et les features SHAP
- `GET /segmentation-summary` pour les cohorts clients
- `GET /model-monitoring` pour l'etat runtime, drift et qualite donnees
- `GET /reports-index` pour les artefacts du dossier `reports`
- `POST /ai-copilot` pour l'assistant local oriente churn

Les modeles chargeables sont generes par `../train_churniq_models.py`: CatBoost, LightGBM, XGBoost, Random Forest, Extra Trees, Decision Tree et Logistic Regression.

FastAPI sert aussi la preview statique:

```text
http://127.0.0.1:8000/ui/preview.html
```

Les placeholders d'illustrations demandes sont dans:

```text
public/assets/illustrations
```
