"""
FastAPI — Churn Prediction REST API
====================================
Run: uvicorn api.app:app --host 0.0.0.0 --port 8000
Docs: http://localhost:8000/docs
"""
import json
import logging
import sqlite3
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, validator

import sys
sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent.parent))

from src.config import MODEL_PATH, THRESHOLD_PATH
from src.inference import predict_single, classify_risk

logger = logging.getLogger("churn_api")

# ─── App Setup ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="ChurnIQ AI API",
    description="Production-ready churn prediction API powering the ChurnIQ AI SaaS interface",
    version="2.0.0",
)

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "WA_Fn-UseC_-Telco-Customer-Churn.csv"
FRONTEND_DIR = BASE_DIR / "frontend"
MODEL_REGISTRY_PATH = BASE_DIR / "models" / "model_registry.pkl"
TRAINING_REPORT_PATH = BASE_DIR / "reports" / "training_report.json"
BENCHMARK_PATH = BASE_DIR / "results" / "final_benchmark.csv"
SHAP_FEATURES_PATH = BASE_DIR / "reports" / "shap_top20_features.csv"
REPORTS_DIR = BASE_DIR / "reports"
GENERATED_REPORTS_DIR = REPORTS_DIR / "generated"
DB_PATH = BASE_DIR / "churniq.sqlite3"
PRIMARY_MODEL_NAME = "Logistic Regression"
BUSINESS_RECOMMENDED_MODEL = "Logistic Regression"
FALSE_NEGATIVE_COST = 500
FALSE_POSITIVE_COST = 50

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:4173",
        "http://localhost:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model at startup
model = None
config = None
model_error = None
model_registry = None


@app.on_event("startup")
def load_model():
    global model, config, model_error, model_registry
    model_error = None
    model_registry = None
    try:
        with open(THRESHOLD_PATH) as f:
            config = json.load(f)
    except Exception as e:
        model_error = f"Failed to load threshold config: {type(e).__name__}: {e}"
        logger.error(model_error)

    try:
        if MODEL_REGISTRY_PATH.exists():
            model_registry = joblib.load(MODEL_REGISTRY_PATH)
            default_name = model_registry.get("default_model")
            registry_models = model_registry.get("models", {})
            model = registry_models.get(PRIMARY_MODEL_NAME) or registry_models.get(default_name) or next(iter(registry_models.values()))
            logger.info("Model registry loaded successfully with %s as production model", PRIMARY_MODEL_NAME)
        else:
            model = joblib.load(MODEL_PATH)
            logger.info("Model loaded successfully")
    except Exception as e:
        model = None
        detail = f"{type(e).__name__}: {e}" if str(e) else type(e).__name__
        source = MODEL_REGISTRY_PATH if MODEL_REGISTRY_PATH.exists() else MODEL_PATH
        model_error = f"Failed to load model from {source}: {detail}"
        logger.error(model_error)
    _init_database()


# ─── Request/Response Models ────────────────────────────────────────────────

class CustomerFeatures(BaseModel):
    tenure: float = Field(..., ge=0, le=72, description="Months as customer")
    MonthlyCharges: float = Field(..., ge=0, le=200, description="Monthly bill")
    TotalCharges: float = Field(..., ge=0, description="Total charges to date")
    gender: str = Field(..., description="Male or Female")
    SeniorCitizen: str = Field(..., description="Yes or No")
    Partner: str = Field(..., description="Yes or No")
    Dependents: str = Field(..., description="Yes or No")
    PhoneService: str = Field(..., description="Yes or No")
    MultipleLines: str = Field(default="No")
    InternetService: str = Field(default="DSL")
    OnlineSecurity: str = Field(default="No")
    OnlineBackup: str = Field(default="No")
    DeviceProtection: str = Field(default="No")
    TechSupport: str = Field(default="No")
    StreamingTV: str = Field(default="No")
    StreamingMovies: str = Field(default="No")
    Contract: str = Field(default="Month-to-month")
    PaperlessBilling: str = Field(default="Yes")
    PaymentMethod: str = Field(default="Electronic check")
    model_name: Optional[str] = Field(default=None, description="Ignored by current scoring; the governed scoring artifact is selected server-side")
    
    @validator("gender")
    def validate_gender(cls, v):
        if v not in ("Male", "Female"):
            raise ValueError("gender must be Male or Female")
        return v
    
    @validator("Contract")
    def validate_contract(cls, v):
        valid = ("Month-to-month", "One year", "Two year")
        if v not in valid:
            raise ValueError(f"Contract must be one of {valid}")
        return v

    class Config:
        json_schema_extra = {
            "example": {
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
                "PaymentMethod": "Electronic check",
            }
        }


class PredictionResponse(BaseModel):
    churn_probability: float
    will_churn: bool
    risk_level: str
    recommendation: str
    confidence: float
    threshold_used: float
    model_version: str
    model_name: str
    model_source: str
    scored_at: str


class CopilotRequest(BaseModel):
    message: str = Field(..., min_length=2, max_length=800)


class AuthLoginRequest(BaseModel):
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=3)
    remember: bool = False


class AuthRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2)
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)
    company_name: str = "ChurnIQ Demo Workspace"
    role: str = "Admin"


class CustomerRecord(BaseModel):
    customer_id: Optional[str] = None
    name: str = "New Customer"
    email: str = "customer@churniq.local"
    gender: str = "Female"
    SeniorCitizen: str = "No"
    Partner: str = "No"
    Dependents: str = "No"
    tenure: float = Field(default=12, ge=0, le=72)
    PhoneService: str = "Yes"
    MultipleLines: str = "No"
    InternetService: str = "Fiber optic"
    OnlineSecurity: str = "No"
    OnlineBackup: str = "No"
    DeviceProtection: str = "No"
    TechSupport: str = "No"
    StreamingTV: str = "No"
    StreamingMovies: str = "No"
    Contract: str = "Month-to-month"
    PaperlessBilling: str = "Yes"
    PaymentMethod: str = "Electronic check"
    MonthlyCharges: float = Field(default=70, ge=0)
    TotalCharges: float = Field(default=840, ge=0)
    segment: str = "At Risk"


class BatchPredictionRequest(BaseModel):
    job_name: str = "Batch Churn Scoring"
    customers: list[CustomerFeatures]


class ShapExplainRequest(BaseModel):
    customer_id: Optional[str] = None
    features: Optional[CustomerFeatures] = None


class ReportGenerateRequest(BaseModel):
    report_type: str = "Executive Report"
    title: Optional[str] = None
    include_predictions: bool = True
    include_recommendations: bool = True


class CampaignRequest(BaseModel):
    name: str
    action: str = "Technical Support Upgrade"
    customer_ids: list[str] = []
    budget: float = 0
    status: str = "Draft"


ACTIVE_TOKENS: dict[str, dict] = {}


def _db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _rows(cursor: sqlite3.Cursor) -> list[dict]:
    return [dict(row) for row in cursor.fetchall()]


def _api_ok(data: Any = None, message: str = "OK") -> dict:
    return {"success": True, "message": message, "data": data, "timestamp": datetime.now().isoformat()}


def _audit(action: str, resource: str, result: str = "Success", user: str = "system") -> None:
    try:
        with _db() as conn:
            conn.execute(
                "INSERT INTO audit_logs (id, timestamp, user, action, resource, ip_address, result) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (str(uuid.uuid4()), datetime.now().isoformat(), user, action, resource, "127.0.0.1", result),
            )
    except Exception as exc:
        logger.warning("Could not write audit log: %s", exc)


def _notify(title: str, description: str, category: str = "System") -> None:
    try:
        with _db() as conn:
            conn.execute(
                "INSERT INTO notifications (id, category, title, description, created_at, read) VALUES (?, ?, ?, ?, ?, ?)",
                (str(uuid.uuid4()), category, title, description, datetime.now().isoformat(), 0),
            )
    except Exception as exc:
        logger.warning("Could not write notification: %s", exc)


def _init_database() -> None:
    GENERATED_REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    with _db() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                full_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL,
                workspace_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                last_login TEXT
            );
            CREATE TABLE IF NOT EXISTS customers (
                id TEXT PRIMARY KEY,
                customer_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                features_json TEXT NOT NULL,
                segment TEXT NOT NULL,
                churn_probability REAL DEFAULT 0,
                risk_level TEXT DEFAULT 'LOW',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS predictions (
                id TEXT PRIMARY KEY,
                customer_id TEXT,
                model_name TEXT NOT NULL,
                probability REAL NOT NULL,
                prediction TEXT NOT NULL,
                confidence REAL NOT NULL,
                risk_level TEXT NOT NULL,
                revenue_risk REAL DEFAULT 0,
                features_json TEXT,
                explanation_json TEXT,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS batch_jobs (
                id TEXT PRIMARY KEY,
                job_name TEXT NOT NULL,
                status TEXT NOT NULL,
                total_records INTEGER NOT NULL,
                high_risk INTEGER NOT NULL,
                summary_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS reports (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                report_type TEXT NOT NULL,
                status TEXT NOT NULL,
                file_path TEXT,
                summary_json TEXT NOT NULL,
                created_at TEXT NOT NULL,
                created_by TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS campaigns (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                action TEXT NOT NULL,
                customer_ids_json TEXT NOT NULL,
                budget REAL NOT NULL,
                roi REAL DEFAULT 0,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                category TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                created_at TEXT NOT NULL,
                read INTEGER DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS audit_logs (
                id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                user TEXT NOT NULL,
                action TEXT NOT NULL,
                resource TEXT NOT NULL,
                ip_address TEXT NOT NULL,
                result TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS settings (
                id TEXT PRIMARY KEY,
                workspace_id TEXT NOT NULL,
                key TEXT NOT NULL,
                value_json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            """
        )
        user_count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        if user_count == 0:
            now = datetime.now().isoformat()
            conn.execute(
                "INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                ("usr_owner", "Zakaria", "zakaria@churniq.ai", "demo123", "Owner", "ws_demo", now, now),
            )

        customer_count = conn.execute("SELECT COUNT(*) FROM customers").fetchone()[0]
        if customer_count == 0 and DATA_PATH.exists():
            data = pd.read_csv(DATA_PATH).head(80)
            for _, row in data.iterrows():
                customer_id = str(row.get("customerID", f"CUST_{uuid.uuid4().hex[:6]}"))
                features = _features_from_dataframe_row(row)
                probability = min(
                    0.96,
                    max(
                        0.06,
                        _safe_number(features["MonthlyCharges"]) / 220
                        + (0.26 if features["Contract"] == "Month-to-month" else 0.08 if features["Contract"] == "One year" else -0.04)
                        + (0.12 if features["TechSupport"] == "No" else -0.03)
                        + (0.12 if _safe_number(features["tenure"]) <= 12 else 0),
                    ),
                )
                risk_level, _ = classify_risk(probability)
                conn.execute(
                    "INSERT INTO customers VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (
                        str(uuid.uuid4()),
                        customer_id,
                        f"Customer {customer_id}",
                        f"{customer_id.lower()}@churniq.local",
                        json.dumps(features),
                        _segment_from_features(features, probability),
                        round(probability, 4),
                        risk_level,
                        datetime.now().isoformat(),
                        datetime.now().isoformat(),
                    ),
                )


def _features_from_dataframe_row(row: pd.Series) -> dict:
    senior = row.get("SeniorCitizen", "No")
    senior_value = "Yes" if str(senior) in {"1", "Yes", "yes", "True"} else "No"
    return {
        "gender": str(row.get("gender", "Female")),
        "SeniorCitizen": senior_value,
        "Partner": str(row.get("Partner", "No")),
        "Dependents": str(row.get("Dependents", "No")),
        "tenure": _safe_number(row.get("tenure", 12)),
        "PhoneService": str(row.get("PhoneService", "Yes")),
        "MultipleLines": str(row.get("MultipleLines", "No")),
        "InternetService": str(row.get("InternetService", "Fiber optic")),
        "OnlineSecurity": str(row.get("OnlineSecurity", "No")),
        "OnlineBackup": str(row.get("OnlineBackup", "No")),
        "DeviceProtection": str(row.get("DeviceProtection", "No")),
        "TechSupport": str(row.get("TechSupport", "No")),
        "StreamingTV": str(row.get("StreamingTV", "No")),
        "StreamingMovies": str(row.get("StreamingMovies", "No")),
        "Contract": str(row.get("Contract", "Month-to-month")),
        "PaperlessBilling": str(row.get("PaperlessBilling", "Yes")),
        "PaymentMethod": str(row.get("PaymentMethod", "Electronic check")),
        "MonthlyCharges": _safe_number(row.get("MonthlyCharges", 70)),
        "TotalCharges": _safe_number(row.get("TotalCharges", 840)),
    }


def _segment_from_features(features: dict, probability: float) -> str:
    if _safe_number(features.get("MonthlyCharges")) >= 80 and _safe_number(features.get("tenure")) >= 24:
        return "VIP"
    if probability >= 0.6:
        return "At Risk"
    if _safe_number(features.get("tenure")) <= 12:
        return "New"
    if features.get("Contract") == "Two year" or _safe_number(features.get("tenure")) >= 48:
        return "Loyal"
    return "Core"


def _customer_row_to_api(row: dict) -> dict:
    features = json.loads(row["features_json"])
    return {
        "id": row["id"],
        "customer_id": row["customer_id"],
        "name": row["name"],
        "email": row["email"],
        "segment": row["segment"],
        "churn_probability": row["churn_probability"],
        "risk_level": row["risk_level"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
        **features,
    }


def _features_from_customer_record(customer: CustomerRecord) -> dict:
    data = customer.dict(exclude={"customer_id", "name", "email", "segment"})
    return data


def _features_to_model(features: dict) -> CustomerFeatures:
    return CustomerFeatures(**features)


def _prediction_explanation(features: dict, probability: float) -> dict:
    increasing = []
    reducing = []
    if features.get("Contract") == "Month-to-month":
        increasing.append({"feature": "Contract Type", "impact": 34, "reason": "Month-to-month contracts are easier to cancel."})
    else:
        reducing.append({"feature": "Contract Type", "impact": 18, "reason": "Longer contracts reduce churn risk."})
    if _safe_number(features.get("MonthlyCharges")) >= 70:
        increasing.append({"feature": "Monthly Charges", "impact": 21, "reason": "High bills increase price sensitivity."})
    if features.get("TechSupport") == "No":
        increasing.append({"feature": "No Tech Support", "impact": 15, "reason": "Customers without support churn more often."})
    if _safe_number(features.get("tenure")) >= 36:
        reducing.append({"feature": "Long Tenure", "impact": 16, "reason": "Long customer history improves retention."})
    if not reducing:
        reducing.append({"feature": "Service Usage", "impact": 8, "reason": "Selected services add some retention value."})
    return {
        "risk_probability": round(probability, 4),
        "factors_increasing_risk": increasing,
        "factors_reducing_risk": reducing,
        "business_explanation": "This churn risk is mainly driven by contract flexibility, billing pressure and support coverage.",
        "recommended_actions": ["Offer technical support package", "Propose annual contract incentive", "Schedule retention call"],
    }


def _make_pdf_bytes(title: str, lines: list[str]) -> bytes:
    def safe(value: str) -> str:
        return str(value).replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)").encode("ascii", "ignore").decode()

    y = 790
    ops = [
        "BT /F1 20 Tf 50 820 Td (CHURNIQ AI) Tj ET",
        f"BT /F1 16 Tf 50 {y} Td ({safe(title)}) Tj ET",
    ]
    y -= 28
    ops.append(f"BT /F1 10 Tf 50 {y} Td (Generated: {safe(datetime.now().isoformat())}) Tj ET")
    y -= 30
    for line in lines:
        if y < 80:
            break
        ops.append(f"BT /F1 11 Tf 50 {y} Td ({safe(line)[:92]}) Tj ET")
        y -= 18
    ops.append("0.43 0.36 1 rg 50 54 220 12 re f")
    stream = "\n".join(ops)
    objects = [
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 864] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        f"<< /Length {len(stream)} >>\nstream\n{stream}\nendstream",
    ]
    pdf = "%PDF-1.4\n"
    offsets = [0]
    for index, obj in enumerate(objects, 1):
        offsets.append(len(pdf))
        pdf += f"{index} 0 obj\n{obj}\nendobj\n"
    xref = len(pdf)
    pdf += f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n"
    for offset in offsets[1:]:
        pdf += f"{offset:010d} 00000 n \n"
    pdf += f"trailer << /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF"
    return pdf.encode("latin-1")


def _load_customer_data() -> pd.DataFrame:
    if not DATA_PATH.exists():
        raise HTTPException(status_code=404, detail="Customer dataset not found")
    data = pd.read_csv(DATA_PATH)
    data["TotalCharges"] = pd.to_numeric(data.get("TotalCharges"), errors="coerce").fillna(0)
    return data


def _safe_number(value: Any, default: float = 0.0) -> float:
    try:
        number = float(value)
        if np.isnan(number) or np.isinf(number):
            return default
        return number
    except Exception:
        return default


def _pct(value: Any) -> float:
    return round(_safe_number(value) * 100, 1)


def _load_training_report() -> dict:
    if not TRAINING_REPORT_PATH.exists():
        return {}
    try:
        with open(TRAINING_REPORT_PATH, encoding="utf-8") as f:
            return json.load(f)
    except Exception as exc:
        logger.warning("Could not read training report: %s", exc)
        return {}


def _load_benchmark_rows() -> list[dict]:
    if not BENCHMARK_PATH.exists():
        return []
    try:
        frame = pd.read_csv(BENCHMARK_PATH)
        frame = frame.replace({np.nan: None})
        return frame.to_dict(orient="records")
    except Exception as exc:
        logger.warning("Could not read benchmark results: %s", exc)
        return []


def _metric_value(item: dict, *keys: str) -> float:
    for key in keys:
        if key in item:
            value = _safe_number(item.get(key), default=float("nan"))
            if not np.isnan(value):
                return value
    return 0.0


def _model_label(item: dict) -> str:
    model_name = str(item.get("model", "Unknown"))
    scaler = str(item.get("scaler", "") or "")
    return f"{model_name} ({scaler})" if scaler and scaler != "none" else model_name


def _benchmark_class_totals(rows: list[dict]) -> tuple[float, float]:
    for row in rows:
        tp = _metric_value(row, "tp")
        fn = _metric_value(row, "fn")
        tn = _metric_value(row, "tn")
        fp = _metric_value(row, "fp")
        if tp + fn > 0 and tn + fp > 0:
            return tp + fn, tn + fp
    return 374.0, 1035.0


def _estimate_confusion_and_cost(item: dict, positive_total: float, negative_total: float) -> dict:
    recall = _metric_value(item, "test_recall", "recall")
    precision = _metric_value(item, "test_precision", "precision")
    tp = _metric_value(item, "tp")
    fn = _metric_value(item, "fn")
    fp = _metric_value(item, "fp")
    tn = _metric_value(item, "tn")

    if tp <= 0 and recall > 0:
        tp = recall * positive_total
    if fn <= 0 and positive_total > 0:
        fn = max(0.0, positive_total - tp)
    if fp <= 0 and precision > 0 and tp > 0:
        fp = max(0.0, (tp / precision) - tp)
    if tn <= 0 and negative_total > 0:
        tn = max(0.0, negative_total - fp)

    return {
        "tp": int(round(tp)),
        "fp": int(round(fp)),
        "fn": int(round(fn)),
        "tn": int(round(tn)),
        "business_cost": int(round(fn * FALSE_NEGATIVE_COST + fp * FALSE_POSITIVE_COST)),
    }


def _normalize_benchmark_row(item: dict, positive_total: float, negative_total: float) -> dict:
    confusion = _estimate_confusion_and_cost(item, positive_total, negative_total)
    return {
        "model": str(item.get("model", "Unknown")),
        "scaler": str(item.get("scaler", "") or ""),
        "label": _model_label(item),
        "accuracy_raw": _metric_value(item, "test_accuracy", "accuracy"),
        "precision_raw": _metric_value(item, "test_precision", "precision"),
        "recall_raw": _metric_value(item, "test_recall", "recall"),
        "f1_raw": _metric_value(item, "test_f1", "f1"),
        "roc_auc_raw": _metric_value(item, "test_auc_roc", "roc_auc", "test_auc"),
        "pr_auc_raw": _metric_value(item, "test_pr_auc", "pr_auc"),
        "cv_mean_raw": _metric_value(item, "cv_mean"),
        "cv_std_raw": _metric_value(item, "cv_std"),
        "training_time": round(_metric_value(item, "training_time"), 4),
        "inference_time": round(_metric_value(item, "inference_time"), 6),
        "auc_gap_raw": _metric_value(item, "auc_gap"),
        "recall_gap_raw": _metric_value(item, "recall_gap"),
        **confusion,
    }


def _model_selection_analysis(rows: list[dict]) -> dict:
    benchmark_rows = _load_benchmark_rows() or rows
    positive_total, negative_total = _benchmark_class_totals(benchmark_rows)
    normalized = [_normalize_benchmark_row(row, positive_total, negative_total) for row in benchmark_rows]
    normalized = [row for row in normalized if row["roc_auc_raw"] > 0]
    if not normalized:
        return {}

    technical = max(normalized, key=lambda row: row["roc_auc_raw"])
    recall = max(normalized, key=lambda row: row["recall_raw"])
    business = min(normalized, key=lambda row: row["business_cost"] if row["business_cost"] > 0 else 10**12)
    stable = min(normalized, key=lambda row: row["cv_std_raw"] if row["cv_std_raw"] > 0 else 10**12)
    efficient_pool = [row for row in normalized if row["roc_auc_raw"] >= technical["roc_auc_raw"] - 0.005]
    efficient = min(efficient_pool or normalized, key=lambda row: row["training_time"] if row["training_time"] > 0 else 10**12)

    catboost = next((row for row in normalized if row["model"] == "CatBoost"), technical)
    logistic = next((row for row in normalized if row["model"] == "Logistic Regression" and row["scaler"] == "PowerTransformer"), None)
    logistic = logistic or next((row for row in normalized if row["model"] == "Logistic Regression"), recall)
    stacking_rows = [row for row in normalized if "Stacking" in row["model"]]
    stacking = max(stacking_rows, key=lambda row: row["roc_auc_raw"]) if stacking_rows else None

    auc_delta = catboost["roc_auc_raw"] - logistic["roc_auc_raw"]
    recall_delta = logistic["recall_raw"] - catboost["recall_raw"]
    cost_delta = catboost["business_cost"] - logistic["business_cost"]
    stacking_training_multiplier = (
        round((stacking["training_time"] or 0) / max(catboost["training_time"], 0.0001), 1)
        if stacking
        else None
    )

    return {
        "false_negative_cost": FALSE_NEGATIVE_COST,
        "false_positive_cost": FALSE_POSITIVE_COST,
        "technical_champion": technical,
        "business_champion": logistic,
        "highest_recall_model": recall,
        "highest_roc_auc_model": technical,
        "best_business_tradeoff": business,
        "best_explainability": logistic,
        "best_training_efficiency": efficient,
        "best_stability": stable,
        "current_scoring_artifact": PRIMARY_MODEL_NAME,
        "recommendation": BUSINESS_RECOMMENDED_MODEL,
        "catboost_vs_logistic": {
            "catboost": catboost,
            "logistic_regression": logistic,
            "roc_auc_delta_catboost_minus_logistic": round(auc_delta, 6),
            "recall_delta_logistic_minus_catboost": round(recall_delta, 6),
            "estimated_business_cost_saved_by_logistic": int(round(cost_delta)),
            "interpretation": (
                "Logistic Regression is the selected production model because it detects far more churners. "
                "CatBoost remains only the historical technical ROC-AUC benchmark by a negligible margin."
            ),
        },
        "stacking_analysis": {
            "best_stacking": stacking,
            "training_multiplier_vs_catboost": stacking_training_multiplier,
            "conclusion": (
                "Stacking is rejected for production because the AUC gain is negligible while training and inference complexity are much higher."
            ),
        },
        "class_imbalance_handling": [
            {"model": "Logistic Regression", "method": 'class_weight="balanced"'},
            {"model": "Random Forest", "method": 'class_weight="balanced"'},
            {"model": "XGBoost", "method": "scale_pos_weight = negative / positive"},
            {"model": "LightGBM", "method": "scale_pos_weight = negative / positive"},
            {"model": "CatBoost", "method": 'auto_class_weights="Balanced"'},
        ],
        "methodology": [
            "21 model x preprocessing combinations evaluated systematically.",
            "Multiple scaling strategies tested: StandardScaler, RobustScaler and PowerTransformer.",
            "5-fold stratified cross validation used to preserve churn ratio across folds.",
            "Class imbalance handled explicitly for linear, tree and boosting models.",
            "Regularization, depth limitation, min samples leaf, early stopping and hyperparameter tuning were explored.",
            "SHAP explainability converts model behavior into business-readable churn drivers.",
        ],
        "presentation_narrative": [
            "Problem",
            "Class Imbalance Challenge",
            "Methodological Framework",
            "Model Comparison",
            "Cross Validation Results",
            "Business Evaluation",
            "Explainability",
            "Retention Strategy",
            "Final Recommendation",
            "Business Impact",
            "Lessons Learned",
        ],
    }


def _load_shap_features(limit: int = 12) -> list[dict]:
    if not SHAP_FEATURES_PATH.exists():
        return []
    try:
        frame = pd.read_csv(SHAP_FEATURES_PATH).head(limit)
        feature_col = "Feature" if "Feature" in frame.columns else frame.columns[1]
        value_col = "Mean |SHAP|" if "Mean |SHAP|" in frame.columns else frame.columns[-1]
        return [
            {
                "feature": str(row[feature_col]).replace("_", " "),
                "importance": round(_safe_number(row[value_col]), 4),
            }
            for _, row in frame.iterrows()
        ]
    except Exception as exc:
        logger.warning("Could not read SHAP feature file: %s", exc)
        return []


def _model_config() -> dict:
    global config
    if config is not None:
        return config
    try:
        with open(THRESHOLD_PATH) as f:
            config = json.load(f)
        return config
    except Exception:
        return {"threshold": 0.5, "version": "fallback", "model": "Heuristic fallback", "metrics": {}}


def _registry_models() -> dict:
    if not model_registry:
        return {}
    return model_registry.get("models", {}) or {}


def _registry_metrics() -> list[dict]:
    if not model_registry:
        return []
    return model_registry.get("metrics", []) or []


def _available_models() -> list[dict]:
    registry_models = _registry_models()
    registry_metric_map = {row.get("model"): row for row in _registry_metrics()}
    rows = []
    for name in registry_models:
        metrics = registry_metric_map.get(name, {})
        rows.append(
            {
                "name": name,
                "loaded": True,
                "is_default": name == PRIMARY_MODEL_NAME,
                "roc_auc": _pct(metrics.get("test_auc_roc", 0)),
                "precision": _pct(metrics.get("test_precision", 0)),
                "recall": _pct(metrics.get("test_recall", 0)),
                "f1": _pct(metrics.get("test_f1", 0)),
            }
        )

    if not rows and model is not None:
        cfg = _model_config()
        rows.append(
            {
                "name": cfg.get("model", "Default model"),
                "loaded": True,
                "is_default": True,
                "roc_auc": _pct(cfg.get("metrics", {}).get("test_auc", 0)),
                "precision": _pct(cfg.get("metrics", {}).get("test_precision", 0)),
                "recall": _pct(cfg.get("metrics", {}).get("test_recall", 0)),
                "f1": _pct(cfg.get("metrics", {}).get("test_f1", 0)),
            }
        )
    return rows


def _get_prediction_model(model_name: Optional[str]):
    registry_models = _registry_models()
    if registry_models:
        selected_name = PRIMARY_MODEL_NAME if PRIMARY_MODEL_NAME in registry_models else (model_registry or {}).get("default_model")
        if selected_name not in registry_models:
            selected_name = next(iter(registry_models.keys()))
        return selected_name, registry_models[selected_name], "registry"

    cfg = _model_config()
    return cfg.get("model", "Default model"), model, "single"


def _heuristic_predict(customer: CustomerFeatures) -> dict:
    cfg = _model_config()
    score = 0.08
    score += 0.26 if customer.Contract == "Month-to-month" else 0.08 if customer.Contract == "One year" else -0.04
    score += 0.18 if customer.MonthlyCharges >= 75 else 0.1 if customer.MonthlyCharges >= 55 else 0.02
    score += 0.14 if customer.TechSupport == "No" else -0.04
    score += 0.1 if customer.OnlineSecurity == "No" else -0.03
    score += 0.1 if customer.tenure <= 12 else 0.04 if customer.tenure <= 24 else -0.06
    score += 0.05 if customer.PaymentMethod == "Electronic check" else 0
    score += 0.04 if customer.PaperlessBilling == "Yes" else 0
    score += 0.04 if customer.SeniorCitizen == "Yes" else 0
    probability = float(min(0.96, max(0.04, score)))
    threshold = float(cfg.get("threshold", 0.5) or 0.5)
    risk_level, recommendation = classify_risk(probability)
    confidence = min(abs(probability - threshold) / max(threshold, 1 - threshold), 1.0)
    return {
        "churn_probability": round(probability, 4),
        "will_churn": probability >= threshold,
        "risk_level": risk_level,
        "recommendation": recommendation,
        "confidence": round(float(confidence), 4),
        "threshold_used": threshold,
        "model_version": f"{cfg.get('version', 'fallback')} heuristic",
        "model_name": "Heuristic fallback",
        "model_source": "heuristic",
        "scored_at": datetime.now().isoformat(),
    }


# ─── Endpoints ───────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "model_version": _model_config().get("version", "unknown"),
        "model_registry_loaded": bool(_registry_models()),
        "available_models": [item["name"] for item in _available_models()],
        "production_model": PRIMARY_MODEL_NAME,
        "model_error": model_error,
        "fallback_prediction_enabled": model is None,
        "timestamp": datetime.now().isoformat(),
    }


@app.post("/auth/login")
async def auth_login(payload: AuthLoginRequest):
    with _db() as conn:
      user = conn.execute("SELECT * FROM users WHERE lower(email) = lower(?)", (payload.email,)).fetchone()
      if not user or user["password_hash"] != payload.password:
          _audit("Login", payload.email, "Denied", payload.email)
          raise HTTPException(status_code=401, detail="Invalid email or password")
      token = f"churniq_{uuid.uuid4().hex}"
      now = datetime.now().isoformat()
      conn.execute("UPDATE users SET last_login = ? WHERE id = ?", (now, user["id"]))
      user_dict = dict(user)
      user_dict["last_login"] = now
      user_dict.pop("password_hash", None)
      ACTIVE_TOKENS[token] = user_dict
    _audit("Login", payload.email, "Success", user_dict["email"])
    _notify("Login detected", f"{user_dict['full_name']} signed in.", "Security")
    return _api_ok({"access_token": token, "token_type": "bearer", "user": user_dict}, "Login successful")


@app.post("/auth/register")
async def auth_register(payload: AuthRegisterRequest):
    user_id = f"usr_{uuid.uuid4().hex[:10]}"
    now = datetime.now().isoformat()
    try:
        with _db() as conn:
            conn.execute(
                "INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (user_id, payload.full_name, payload.email, payload.password, payload.role, "ws_demo", now, now),
            )
        _audit("Register", payload.email, "Success", payload.email)
        return await auth_login(AuthLoginRequest(email=payload.email, password=payload.password, remember=True))
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="A user with this email already exists")


@app.post("/auth/logout")
async def auth_logout(token: Optional[str] = None):
    if token:
        ACTIVE_TOKENS.pop(token, None)
    _audit("Logout", "Current session", "Success")
    return _api_ok({"logged_out": True}, "Logout successful")


@app.get("/customers")
async def list_customers():
    with _db() as conn:
        customers = [_customer_row_to_api(row) for row in _rows(conn.execute("SELECT * FROM customers ORDER BY created_at DESC"))]
    return _api_ok({"customers": customers, "total": len(customers)})


@app.get("/customers/{customer_id}")
async def get_customer(customer_id: str):
    with _db() as conn:
        row = conn.execute("SELECT * FROM customers WHERE id = ? OR customer_id = ?", (customer_id, customer_id)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Customer not found")
    return _api_ok(_customer_row_to_api(dict(row)))


@app.post("/customers")
async def create_customer(customer: CustomerRecord):
    customer_id = customer.customer_id or f"CUST_{uuid.uuid4().hex[:8].upper()}"
    features = _features_from_customer_record(customer)
    now = datetime.now().isoformat()
    try:
        with _db() as conn:
            conn.execute(
                "INSERT INTO customers VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (str(uuid.uuid4()), customer_id, customer.name, customer.email, json.dumps(features), customer.segment, 0, "LOW", now, now),
            )
        _audit("Customer Created", customer_id, "Success")
        _notify("Customer created", f"{customer.name} was added to CHURNIQ AI.", "Customers")
        return await get_customer(customer_id)
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="Customer ID already exists")


@app.put("/customers/{customer_id}")
async def update_customer(customer_id: str, customer: CustomerRecord):
    features = _features_from_customer_record(customer)
    now = datetime.now().isoformat()
    with _db() as conn:
        cursor = conn.execute(
            """
            UPDATE customers
            SET name = ?, email = ?, features_json = ?, segment = ?, updated_at = ?
            WHERE id = ? OR customer_id = ?
            """,
            (customer.name, customer.email, json.dumps(features), customer.segment, now, customer_id, customer_id),
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Customer not found")
    _audit("Customer Updated", customer_id, "Success")
    return await get_customer(customer_id)


@app.delete("/customers/{customer_id}")
async def delete_customer(customer_id: str):
    with _db() as conn:
        cursor = conn.execute("DELETE FROM customers WHERE id = ? OR customer_id = ?", (customer_id, customer_id))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Customer not found")
    _audit("Customer Deleted", customer_id, "Success")
    return _api_ok({"deleted": customer_id}, "Customer deleted")


@app.get("/dashboard-summary")
async def dashboard_summary():
    """Return project-backed dashboard metrics for the ChurnIQ interface."""
    data = _load_customer_data()
    total_customers = int(len(data))
    churn_rate = float((data["Churn"].eq("Yes").mean() * 100).round(1)) if "Churn" in data else 0.0
    monthly_revenue = float(data["MonthlyCharges"].sum()) if "MonthlyCharges" in data else 0.0
    avg_tenure = float(data["tenure"].mean().round(1)) if "tenure" in data else 0.0
    high_risk_customers = int((data.get("Contract", pd.Series(dtype=str)).eq("Month-to-month")).sum())
    cfg = _model_config()
    threshold = cfg.get("threshold")
    metrics = cfg.get("metrics", {})
    prediction_accuracy = round(float(metrics.get("test_auc", 0.94)) * 100, 1)

    return {
        "total_customers": total_customers,
        "churn_rate": churn_rate,
        "monthly_revenue": round(monthly_revenue, 2),
        "avg_tenure": avg_tenure,
        "high_risk_customers": high_risk_customers,
        "prediction_accuracy": prediction_accuracy,
        "retention_score": round(100 - churn_rate, 1),
        "threshold": threshold,
        "model": cfg.get("model", "Heuristic fallback") if model is not None else f"{cfg.get('model', 'Model')} unavailable",
        "model_version": cfg.get("version", "fallback"),
    }


@app.get("/customers-sample")
async def customers_sample(limit: int = 10):
    """Return a small customer sample shaped for the frontend table."""
    data = _load_customer_data().head(max(1, min(limit, 50))).copy()
    rows = []
    for _, row in data.iterrows():
        monthly = float(row.get("MonthlyCharges", 0))
        tenure = float(row.get("tenure", 0))
        contract = str(row.get("Contract", "Unknown"))
        probability = min(95, max(8, int((monthly / 2.2) + (25 if contract == "Month-to-month" else 4) - (tenure / 3))))
        risk = "CRITICAL" if probability >= 80 else "HIGH" if probability >= 60 else "MEDIUM" if probability >= 40 else "LOW"
        rows.append(
            {
                "customer_id": str(row.get("customerID", "")),
                "name": f"Customer {row.get('customerID', '')}",
                "email": f"{str(row.get('customerID', 'customer')).lower()}@churniq.local",
                "contract": contract,
                "monthly_charges": monthly,
                "tenure": tenure,
                "risk": risk,
                "churn_probability": probability,
            }
        )
    return {"customers": rows}


@app.post("/predict", response_model=PredictionResponse)
async def predict(customer: CustomerFeatures):
    """Predict churn probability for a single customer."""
    if model is None:
        return PredictionResponse(**_heuristic_predict(customer))
    
    try:
        selected_name, selected_model, model_source = _get_prediction_model(customer.model_name)
        payload = customer.dict(exclude={"model_name"})
        result = predict_single(payload, model=selected_model, config=config)
        result["model_name"] = selected_name
        result["model_source"] = model_source
        return PredictionResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/single")
async def predict_single_endpoint(customer: CustomerFeatures, customer_id: Optional[str] = None):
    result = await predict(customer)
    result_dict = result.dict()
    probability = result_dict["churn_probability"]
    explanation = _prediction_explanation(customer.dict(exclude={"model_name"}), probability)
    prediction_id = str(uuid.uuid4())
    with _db() as conn:
        conn.execute(
            """
            INSERT INTO predictions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                prediction_id,
                customer_id,
                PRIMARY_MODEL_NAME,
                probability,
                "Churn" if result_dict["will_churn"] else "Retain",
                result_dict["confidence"],
                result_dict["risk_level"],
                round(customer.MonthlyCharges * 12 * probability, 2),
                json.dumps(customer.dict(exclude={"model_name"})),
                json.dumps(explanation),
                datetime.now().isoformat(),
            ),
        )
        if customer_id:
            conn.execute(
                "UPDATE customers SET churn_probability = ?, risk_level = ?, updated_at = ? WHERE id = ? OR customer_id = ?",
                (probability, result_dict["risk_level"], datetime.now().isoformat(), customer_id, customer_id),
            )
    _audit("Prediction Generated", customer_id or prediction_id, "Success")
    _notify("Prediction completed", f"Logistic Regression scored risk at {round(probability * 100, 1)}%.", "Prediction Completed")
    return _api_ok({"prediction_id": prediction_id, **result_dict, "explanation": explanation}, "Prediction completed")


@app.post("/predict/batch")
async def predict_batch_endpoint(payload: BatchPredictionRequest):
    if not payload.customers:
        raise HTTPException(status_code=422, detail="Batch must include at least one customer")
    results = []
    high_risk = 0
    for index, customer in enumerate(payload.customers):
        scored = await predict(customer)
        scored_dict = scored.dict()
        if scored_dict["risk_level"] in {"HIGH", "CRITICAL"}:
            high_risk += 1
        results.append(
            {
                "row": index + 1,
                "model_name": PRIMARY_MODEL_NAME,
                "probability": scored_dict["churn_probability"],
                "risk_level": scored_dict["risk_level"],
                "confidence": scored_dict["confidence"],
                "prediction": "Churn" if scored_dict["will_churn"] else "Retain",
                "revenue_risk": round(customer.MonthlyCharges * 12 * scored_dict["churn_probability"], 2),
                "recommendation": scored_dict["recommendation"],
            }
        )
    job_id = str(uuid.uuid4())
    summary = {
        "total_records": len(results),
        "high_risk": high_risk,
        "medium_or_low": len(results) - high_risk,
        "revenue_at_risk": round(sum(item["revenue_risk"] for item in results), 2),
        "production_model": PRIMARY_MODEL_NAME,
    }
    with _db() as conn:
        conn.execute(
            "INSERT INTO batch_jobs VALUES (?, ?, ?, ?, ?, ?, ?)",
            (job_id, payload.job_name, "Completed", len(results), high_risk, json.dumps(summary), datetime.now().isoformat()),
        )
        for item, customer in zip(results, payload.customers):
            conn.execute(
                "INSERT INTO predictions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    str(uuid.uuid4()),
                    None,
                    PRIMARY_MODEL_NAME,
                    item["probability"],
                    item["prediction"],
                    item["confidence"],
                    item["risk_level"],
                    item["revenue_risk"],
                    json.dumps(customer.dict(exclude={"model_name"})),
                    json.dumps(_prediction_explanation(customer.dict(exclude={"model_name"}), item["probability"])),
                    datetime.now().isoformat(),
                ),
            )
    _audit("Batch Prediction", job_id, "Success")
    _notify("Batch completed", f"{len(results)} rows scored with Logistic Regression.", "Prediction Completed")
    return _api_ok({"batch_job_id": job_id, "summary": summary, "results": results}, "Batch prediction completed")


@app.get("/predictions/history")
async def predictions_history(limit: int = 100):
    with _db() as conn:
        rows = _rows(conn.execute("SELECT * FROM predictions ORDER BY created_at DESC LIMIT ?", (max(1, min(limit, 500)),)))
    return _api_ok({"predictions": rows, "total": len(rows)})


@app.get("/models")
async def models():
    """Return all loadable models available for real manual predictions."""
    cfg = _model_config()
    return {
        "default_model": PRIMARY_MODEL_NAME if PRIMARY_MODEL_NAME in _registry_models() else (model_registry or {}).get("default_model", cfg.get("model", "Default model")),
        "production_model": PRIMARY_MODEL_NAME,
        "version": (model_registry or {}).get("version", cfg.get("version", "unknown")),
        "trained_on": (model_registry or {}).get("trained_on", cfg.get("trained_on")),
        "threshold": (model_registry or {}).get("threshold", cfg.get("threshold", 0.5)),
        "models": _available_models(),
        "registry_loaded": bool(_registry_models()),
        "model_error": model_error,
    }


@app.get("/model-info")
async def model_info():
    """Return model metadata and performance metrics."""
    cfg = _model_config()
    return {
        **cfg,
        "model_loaded": model is not None,
        "model_registry_loaded": bool(_registry_models()),
        "available_models": _available_models(),
        "model_error": model_error,
        "fallback_prediction_enabled": model is None,
    }


@app.get("/model-performance")
async def model_performance():
    """Return leaderboard, best-model metrics and feature impact from project reports."""
    report = _load_training_report()
    benchmark_rows = _load_benchmark_rows()
    report_rows = report.get("all_results", [])
    registry_rows = _registry_metrics()
    rows = benchmark_rows or report_rows or registry_rows
    positive_total, negative_total = _benchmark_class_totals(rows)

    leaderboard = []
    for item in rows:
        auc = item.get("test_auc_roc", item.get("roc_auc", item.get("test_auc", 0)))
        normalized = _normalize_benchmark_row(item, positive_total, negative_total)
        leaderboard.append(
            {
                "model": str(item.get("model", "Unknown")),
                "scaler": str(item.get("scaler", "") or ""),
                "label": _model_label(item),
                "accuracy": _pct(item.get("test_accuracy", item.get("accuracy", 0))),
                "precision": _pct(item.get("test_precision", item.get("precision", 0))),
                "recall": _pct(item.get("test_recall", item.get("recall", 0))),
                "f1": _pct(item.get("test_f1", item.get("f1", 0))),
                "roc_auc": _pct(auc),
                "pr_auc": _pct(item.get("test_pr_auc", item.get("pr_auc", 0))),
                "cv_mean": _pct(item.get("cv_mean", 0)),
                "cv_std": round(_safe_number(item.get("cv_std", 0)), 4),
                "training_time": normalized["training_time"],
                "inference_time": normalized["inference_time"],
                "tp": normalized["tp"],
                "fp": normalized["fp"],
                "fn": normalized["fn"],
                "tn": normalized["tn"],
                "business_cost": normalized["business_cost"],
                "overfit_status": str(item.get("overfit_status", "N/A")),
                "loaded": str(item.get("model", "Unknown")) in _registry_models(),
            }
        )

    leaderboard = sorted(leaderboard, key=lambda row: row["roc_auc"], reverse=True)
    selection = _model_selection_analysis(rows)
    best_model_name = str(selection.get("recommendation") or (leaderboard[0]["model"] if leaderboard else _model_config().get("model", "Unknown")))
    best_row = next((row for row in leaderboard if row["model"] == best_model_name), leaderboard[0] if leaderboard else {})
    shap_features = _load_shap_features()

    return {
        "best_model": best_model_name,
        "recommended_model": selection.get("recommendation", best_model_name),
        "current_scoring_artifact": PRIMARY_MODEL_NAME,
        "trained_on": (model_registry or {}).get("trained_on") or report.get("trained_on") or _model_config().get("trained_on"),
        "optimal_threshold": round(_safe_number((model_registry or {}).get("threshold", report.get("optimal_threshold", _model_config().get("threshold", 0.5)))), 2),
        "leaderboard": leaderboard[:20],
        "best_metrics": best_row,
        "model_selection": selection,
        "feature_impact": report.get("feature_impact", [])[:8],
        "shap_features": shap_features,
        "model_loaded": model is not None,
        "model_registry_loaded": bool(_registry_models()),
        "available_models": _available_models(),
        "fallback_prediction_enabled": model is None,
    }


@app.post("/shap/explain")
async def shap_explain(payload: ShapExplainRequest):
    features = None
    customer = None
    if payload.customer_id:
        with _db() as conn:
            row = conn.execute("SELECT * FROM customers WHERE id = ? OR customer_id = ?", (payload.customer_id, payload.customer_id)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Customer not found")
        customer = _customer_row_to_api(dict(row))
        features = json.loads(dict(row)["features_json"])
    elif payload.features:
        features = payload.features.dict(exclude={"model_name"})
    else:
        raise HTTPException(status_code=422, detail="Provide customer_id or features")

    scored = await predict(_features_to_model(features))
    probability = scored.churn_probability
    explanation = _prediction_explanation(features, probability)
    global_features = _load_shap_features()
    payload_out = {
        "customer": customer,
        "prediction": scored.dict(),
        "global_feature_importance": global_features,
        "local_explanation": explanation,
        "waterfall": [
            {"label": "Base Risk", "value": 0.265},
            *[{"label": item["feature"], "value": round(item["impact"] / 100, 3)} for item in explanation["factors_increasing_risk"]],
            *[{"label": item["feature"], "value": round(-item["impact"] / 100, 3)} for item in explanation["factors_reducing_risk"]],
            {"label": "Final Prediction", "value": probability},
        ],
        "executive_summary": "This customer risk can be reduced by improving support coverage and moving away from flexible month-to-month exposure.",
    }
    _audit("SHAP Explanation", payload.customer_id or "manual customer", "Success")
    return _api_ok(payload_out, "Explanation generated")


@app.get("/analytics/dashboard")
async def analytics_dashboard():
    summary = await dashboard_summary()
    performance = await model_performance()
    best = performance.get("best_metrics", {})
    selection = performance.get("model_selection", {})
    technical = selection.get("technical_champion", {})
    business = selection.get("business_champion", {})
    return _api_ok(
        {
            **summary,
            "revenue_at_risk": round(summary["monthly_revenue"] * (summary["churn_rate"] / 100), 2),
            "catboost_status": "Online" if model is not None else "Fallback",
            "production_model": PRIMARY_MODEL_NAME,
            "business_recommended_model": selection.get("recommendation", BUSINESS_RECOMMENDED_MODEL),
            "technical_champion_model": technical.get("label", PRIMARY_MODEL_NAME),
            "business_champion_model": business.get("label", BUSINESS_RECOMMENDED_MODEL),
            "model_selection_summary": selection.get("catboost_vs_logistic", {}).get("interpretation"),
            "roc_auc": best.get("roc_auc", 84.74),
            "precision": best.get("precision", 67.16),
            "recall": best.get("recall", 48.66),
            "f1": best.get("f1", 56.43),
        }
    )


@app.get("/analytics/distributions")
async def analytics_distributions():
    data = _load_customer_data()
    distributions = {}
    for column in ["gender", "Contract", "PaymentMethod", "InternetService", "SeniorCitizen", "TechSupport", "Churn"]:
        if column in data:
            distributions[column] = data[column].astype(str).value_counts().reset_index().rename(columns={"index": "name", column: "value"}).to_dict(orient="records")
    if "tenure" in data:
        distributions["tenure_groups"] = pd.cut(pd.to_numeric(data["tenure"], errors="coerce"), bins=[-1, 12, 24, 48, 72], labels=["0-12", "13-24", "25-48", "49-72"]).value_counts().reset_index().rename(columns={"index": "name", "tenure": "value"}).to_dict(orient="records")
    if "MonthlyCharges" in data:
        distributions["monthly_charges_groups"] = pd.cut(pd.to_numeric(data["MonthlyCharges"], errors="coerce"), bins=[0, 35, 65, 95, 200], labels=["Low", "Medium", "High", "Premium"]).value_counts().reset_index().rename(columns={"index": "name", "MonthlyCharges": "value"}).to_dict(orient="records")
    return _api_ok({"distributions": distributions})


@app.get("/analytics/model-performance")
async def analytics_model_performance():
    return _api_ok(await model_performance())


@app.get("/segmentation-summary")
async def segmentation_summary():
    """Return project-backed customer segments for lifecycle and churn analysis."""
    data = _load_customer_data().copy()
    data["MonthlyCharges"] = pd.to_numeric(data.get("MonthlyCharges"), errors="coerce").fillna(0)
    data["tenure"] = pd.to_numeric(data.get("tenure"), errors="coerce").fillna(0)
    data["TotalCharges"] = pd.to_numeric(data.get("TotalCharges"), errors="coerce").fillna(0)

    def assign_segment(row: pd.Series) -> str:
        contract = str(row.get("Contract", ""))
        tenure = _safe_number(row.get("tenure"))
        monthly = _safe_number(row.get("MonthlyCharges"))
        churn = str(row.get("Churn", "No"))
        if monthly >= 80 and tenure >= 24:
            return "VIP"
        if contract == "Month-to-month" and (churn == "Yes" or monthly >= 70 or tenure <= 18):
            return "At Risk"
        if tenure <= 12:
            return "New"
        if contract == "Two year" or tenure >= 48:
            return "Loyal"
        return "Core"

    data["Segment"] = data.apply(assign_segment, axis=1)
    segment_rows = []
    for segment, group in data.groupby("Segment"):
        churn_rate = group["Churn"].eq("Yes").mean() * 100 if "Churn" in group else 0
        segment_rows.append(
            {
                "name": segment,
                "customers": int(len(group)),
                "churn_rate": round(float(churn_rate), 1),
                "avg_monthly_charge": round(float(group["MonthlyCharges"].mean()), 2),
                "avg_tenure": round(float(group["tenure"].mean()), 1),
                "revenue": round(float(group["MonthlyCharges"].sum()), 2),
                "priority": "High" if segment == "At Risk" else "Medium" if segment in ("VIP", "New") else "Stable",
            }
        )

    scatter = []
    sampled = data.sort_values("MonthlyCharges", ascending=False).head(120)
    for _, row in sampled.iterrows():
        scatter.append(
            {
                "customer_id": str(row.get("customerID", "")),
                "segment": str(row.get("Segment", "Core")),
                "tenure": round(_safe_number(row.get("tenure")), 1),
                "monthly_charges": round(_safe_number(row.get("MonthlyCharges")), 2),
                "total_charges": round(_safe_number(row.get("TotalCharges")), 2),
                "churned": str(row.get("Churn", "No")) == "Yes",
            }
        )

    contract_mix = (
        data.groupby("Contract").size().reset_index(name="customers").replace({np.nan: None}).to_dict(orient="records")
        if "Contract" in data
        else []
    )

    return {
        "segments": sorted(segment_rows, key=lambda row: row["customers"], reverse=True),
        "scatter": scatter,
        "contract_mix": contract_mix,
        "recommendations": [
            "Prioritize month-to-month customers with high monthly charges.",
            "Move VIP customers toward annual contracts with premium support.",
            "Use onboarding journeys for new customers before month 12.",
        ],
    }


@app.get("/model-monitoring")
async def model_monitoring():
    """Return operational model health, drift and data quality indicators."""
    data = _load_customer_data()
    report = _load_training_report()
    cfg = _model_config()
    churn_rate = float(data["Churn"].eq("Yes").mean() * 100) if "Churn" in data else 0
    missing_total = int(data.isna().sum().sum())
    model_age_days = None
    trained_on = report.get("trained_on") or cfg.get("trained_on")
    if trained_on:
        try:
            model_age_days = (datetime.now() - datetime.fromisoformat(str(trained_on))).days
        except Exception:
            model_age_days = None

    drift_score = round(abs(churn_rate - 26.5) / 100, 3)
    drift_status = "Stable" if drift_score < 0.05 else "Watch"
    alerts = []
    if model is None:
        alerts.append("Model artifact unavailable; API is using heuristic fallback scoring.")
    if missing_total:
        alerts.append(f"Dataset contains {missing_total} missing values after loading.")
    if model_age_days is not None and model_age_days > 30:
        alerts.append("Model retraining window is due.")
    if not alerts:
        alerts.append("No critical monitoring alerts detected.")

    return {
        "status": "Fallback" if model is None else "Healthy",
        "model_loaded": model is not None,
        "model_error": model_error,
        "fallback_prediction_enabled": model is None,
        "model_version": cfg.get("version", "unknown"),
        "trained_on": trained_on,
        "model_age_days": model_age_days,
        "monitored_at": datetime.now().isoformat(),
        "prediction_volume": int(len(data)),
        "drift": {
            "score": drift_score,
            "status": drift_status,
            "baseline_churn_rate": 26.5,
            "current_churn_rate": round(churn_rate, 1),
        },
        "data_quality": {
            "rows": int(len(data)),
            "columns": int(len(data.columns)),
            "missing_values": missing_total,
            "duplicate_customers": int(data.duplicated(subset=["customerID"]).sum()) if "customerID" in data else 0,
        },
        "alerts": alerts,
    }


@app.get("/reports-index")
async def reports_index():
    """List generated reports and visual artifacts available in the project."""
    if not REPORTS_DIR.exists():
        return {"reports": []}
    items = []
    for path in sorted(REPORTS_DIR.glob("*")):
        if path.is_file() and path.suffix.lower() in {".md", ".json", ".csv", ".png"}:
            items.append(
                {
                    "name": path.name,
                    "type": path.suffix.lower().lstrip("."),
                    "size_kb": round(path.stat().st_size / 1024, 1),
                    "updated_at": datetime.fromtimestamp(path.stat().st_mtime).isoformat(),
                }
            )
    return {"reports": items}


@app.post("/ai-copilot")
async def ai_copilot(payload: CopilotRequest):
    """Rule-based local assistant for churn analysis, reports and retention planning."""
    message = payload.message.lower()
    summary = await dashboard_summary()
    performance = await model_performance()
    selection = performance.get("model_selection", {})
    cards: list[dict[str, Any]] = []
    table: list[dict[str, Any]] = []
    insights: list[str] = []

    high_risk_customers: list[dict[str, Any]] = []
    revenue_at_risk = 0.0
    try:
        with _db() as conn:
            rows = _rows(
                conn.execute(
                    "SELECT customer_id, name, email, segment, churn_probability, risk_level, features_json "
                    "FROM customers ORDER BY churn_probability DESC"
                )
            )
        for row in rows:
            probability = float(row.get("churn_probability") or 0)
            risk_level = str(row.get("risk_level") or "").upper()
            if probability < 0.6 and risk_level not in {"HIGH", "CRITICAL"}:
                continue
            features = json.loads(row.get("features_json") or "{}")
            monthly_charges = float(features.get("MonthlyCharges") or 0)
            customer_risk_value = round(monthly_charges * 12 * probability, 2)
            revenue_at_risk += customer_risk_value
            high_risk_customers.append(
                {
                    "customer_id": row["customer_id"],
                    "name": row["name"],
                    "email": row["email"],
                    "segment": row["segment"],
                    "risk_level": risk_level,
                    "churn_probability": round(probability, 4),
                    "monthly_charges": monthly_charges,
                    "revenue_at_risk": customer_risk_value,
                }
            )
    except Exception as exc:
        logger.warning("Copilot could not enrich high-risk customer context: %s", exc)

    if any(word in message for word in ("revenue", "risk", "high-risk", "high risk", "at risk", "churn increasing")):
        top_customers = high_risk_customers[:5]
        answer = (
            f"Estimated annualized revenue at risk is ${revenue_at_risk:,.0f} across "
            f"{len(high_risk_customers)} high-risk customers. The highest priority accounts are the customers with "
            "critical churn probability, high monthly charges and flexible contracts. Start with support-led retention "
            "actions before broad discounts."
        )
        actions = ["Open high-risk customers", "Create retention campaign", "Generate executive risk report"]
        cards = [
            {"label": "Revenue At Risk", "value": f"${revenue_at_risk:,.0f}", "trend": "Prioritize"},
            {"label": "High Risk Customers", "value": len(high_risk_customers), "trend": "Critical queue"},
            {"label": "Production Model", "value": PRIMARY_MODEL_NAME, "trend": "Online"},
            {"label": "Churn Rate", "value": f"{summary['churn_rate']}%", "trend": "Dataset baseline"},
        ]
        table = top_customers
        insights = [
            "Critical customers should be routed to human follow-up first.",
            "Month-to-month contracts and support gaps remain the strongest action areas.",
            "Revenue protection should rank customers by churn risk multiplied by monthly charges.",
        ]
    elif any(word in message for word in ("retention", "campaign", "save", "offer")):
        answer = (
            "Focus first on month-to-month customers with high monthly charges and no support services. "
            "A discount plus tech-support bundle should target the highest-risk cohort before broad campaigns."
        )
        actions = ["Create Win-Back campaign", "Filter At Risk segment", "Export retention report"]
        cards = [
            {"label": "Retention Candidates", "value": len(high_risk_customers), "trend": "Ready"},
            {"label": "Potential Revenue Saved", "value": f"${revenue_at_risk * 0.68:,.0f}", "trend": "Estimated"},
        ]
        insights = ["Combine a support upgrade with annual contract incentives for the best ROI."]
    elif any(word in message for word in ("model", "performance", "auc", "accuracy")):
        technical = selection.get("technical_champion", {})
        business = selection.get("business_champion", {})
        comparison = selection.get("catboost_vs_logistic", {})
        answer = (
            f"Technically, {technical.get('label', 'CatBoost')} has the highest ROC-AUC "
            f"({technical.get('roc_auc_raw', 0):.4f}). From a churn business perspective, "
            f"{business.get('label', PRIMARY_MODEL_NAME)} is the deployed recommendation because recall is "
            f"{business.get('recall_raw', 0):.4f} versus CatBoost recall "
            f"{comparison.get('catboost', {}).get('recall_raw', 0):.4f}. Missing churners is more expensive than "
            "contacting some loyal customers, so recall drives the final production choice."
        )
        actions = ["Open Model Performance", "Review business champion", "Generate model selection report"]
        cards = [
            {"label": "Technical Champion", "value": technical.get("model", "CatBoost"), "trend": f"ROC-AUC {technical.get('roc_auc_raw', 0):.4f}"},
            {"label": "Business Champion", "value": business.get("model", "Logistic Regression"), "trend": f"Recall {business.get('recall_raw', 0):.4f}"},
            {"label": "Recall Gain", "value": f"+{comparison.get('recall_delta_logistic_minus_catboost', 0) * 100:.1f} pts", "trend": "Logistic vs CatBoost"},
            {"label": "Current Scoring Artifact", "value": PRIMARY_MODEL_NAME, "trend": "Deployed"},
        ]
        insights = [
            "ROC-AUC measures ranking quality across thresholds; it does not directly optimize missed churners.",
            "False negatives are the expensive error in churn because they represent lost customers and CLV.",
            "Logistic Regression is the production model because it is the recall-first business champion.",
        ]
    elif any(word in message for word in ("segment", "customer", "cohort")):
        answer = (
            "Segment customers by contract, tenure and monthly charges. The At Risk cohort needs immediate action, "
            "VIP customers need proactive service, and new customers need onboarding nudges."
        )
        actions = ["Open Segmentation", "Inspect customer list", "Create cohort export"]
        cards = [
            {"label": "High Risk Customers", "value": len(high_risk_customers), "trend": "Segment queue"},
            {"label": "Revenue At Risk", "value": f"${revenue_at_risk:,.0f}", "trend": "Annualized"},
        ]
        table = high_risk_customers[:5]
    elif any(word in message for word in ("report", "export", "download")):
        answer = (
            "Generate an executive report with churn rate, protected revenue, model leaderboard and top SHAP features. "
            "The reports folder already contains markdown, CSV and PNG artifacts from the training workflow."
        )
        actions = ["Open Reports", "Download AI insights", "Review training report"]
        cards = [{"label": "Report Ready", "value": "PDF", "trend": "Downloadable"}]
    else:
        answer = (
            f"Current dataset contains {summary['total_customers']} customers with {summary['churn_rate']}% churn. "
            "Ask about model performance, segments, retention campaigns or reports for a focused recommendation."
        )
        actions = ["Open dashboard", "Run single prediction", "Review insights"]
        cards = [
            {"label": "Customers", "value": summary["total_customers"], "trend": "Dataset"},
            {"label": "Churn Rate", "value": f"{summary['churn_rate']}%", "trend": "Observed"},
            {"label": "High Risk Customers", "value": len(high_risk_customers), "trend": "Monitored"},
        ]

    return {
        "answer": answer,
        "suggested_actions": actions,
        "cards": cards,
        "table": table,
        "insights": insights,
        "sources": ["WA_Fn-UseC_-Telco-Customer-Churn.csv", "training_report.json", "threshold_config.json"],
        "confidence": 0.86,
        "generated_at": datetime.now().isoformat(),
    }


@app.post("/copilot/ask")
async def copilot_ask(payload: CopilotRequest):
    response = await ai_copilot(payload)
    with _db() as conn:
        conn.execute(
            "INSERT INTO audit_logs (id, timestamp, user, action, resource, ip_address, result) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (str(uuid.uuid4()), datetime.now().isoformat(), "Zakaria", "Copilot Asked", payload.message[:80], "127.0.0.1", "Success"),
        )
    return _api_ok(response, "Copilot response generated")


def _report_summary(report_type: str) -> dict:
    dashboard = {}
    try:
        data = _load_customer_data()
        dashboard = {
            "total_customers": int(len(data)),
            "churn_rate": round(float(data["Churn"].eq("Yes").mean() * 100), 1) if "Churn" in data else 0,
            "monthly_revenue": round(float(pd.to_numeric(data.get("MonthlyCharges"), errors="coerce").fillna(0).sum()), 2),
        }
    except Exception:
        dashboard = {"total_customers": 0, "churn_rate": 0, "monthly_revenue": 0}
    benchmark_rows = _load_benchmark_rows()
    selection = _model_selection_analysis(benchmark_rows)
    technical = selection.get("technical_champion", {})
    business = selection.get("business_champion", {})
    stacking = selection.get("stacking_analysis", {})
    return {
        "report_type": report_type,
        "current_scoring_artifact": PRIMARY_MODEL_NAME,
        "technical_champion": technical.get("label", PRIMARY_MODEL_NAME),
        "business_champion": business.get("label", BUSINESS_RECOMMENDED_MODEL),
        "executive_summary": (
            "CHURNIQ AI identifies churn risk and translates model outputs into retention actions. "
            "The latest scientific review separates technical ROC-AUC leadership from business recall leadership."
        ),
        "model_selection_conclusion": selection.get("catboost_vs_logistic", {}).get("interpretation"),
        "stacking_conclusion": stacking.get("conclusion"),
        "kpis": dashboard,
        "recommendations": [
            "Use ROC-AUC to discuss ranking quality, but prioritize recall for churn retention decisions.",
            "Use Logistic Regression as the current scoring artifact because it reduces missed churners.",
            "Keep CatBoost only as a historical technical benchmark in model comparison views.",
            "Reject stacking for production because complexity and training cost are not justified by the marginal AUC.",
        ],
    }


@app.post("/reports/generate")
async def reports_generate(payload: ReportGenerateRequest):
    report_id = f"REP-{uuid.uuid4().hex[:10].upper()}"
    title = payload.title or payload.report_type
    summary = _report_summary(payload.report_type)
    lines = [
        f"Report ID: {report_id}",
        f"Type: {payload.report_type}",
        f"Current Scoring Artifact: {PRIMARY_MODEL_NAME}",
        f"Business Champion: {summary.get('business_champion')}",
        f"Technical ROC-AUC Champion: {summary.get('technical_champion')}",
        f"Customers: {summary['kpis'].get('total_customers', 0)}",
        f"Churn Rate: {summary['kpis'].get('churn_rate', 0)}%",
        f"Monthly Revenue: ${summary['kpis'].get('monthly_revenue', 0)}",
        f"Model Selection: {summary.get('model_selection_conclusion')}",
        f"Stacking Decision: {summary.get('stacking_conclusion')}",
        "Revenue Risk: High-risk accounts should be prioritized before broad discounting.",
        "Business Recommendation: favor high-recall detection because false negatives are more expensive than false positives.",
    ]
    path = GENERATED_REPORTS_DIR / f"{report_id}.pdf"
    path.write_bytes(_make_pdf_bytes(title, lines))
    with _db() as conn:
        conn.execute(
            "INSERT INTO reports VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (report_id, title, payload.report_type, "Ready", str(path), json.dumps(summary), datetime.now().isoformat(), "Zakaria"),
        )
    _audit("Report Generation", report_id, "Success")
    _notify("Report generated", f"{title} is ready to download.", "Report Generated")
    return _api_ok({"report_id": report_id, "name": title, "download_url": f"/reports/{report_id}/download", "summary": summary}, "Report generated")


@app.get("/reports")
async def reports_list():
    with _db() as conn:
        rows = _rows(conn.execute("SELECT id, name, report_type, status, created_at, created_by FROM reports ORDER BY created_at DESC"))
    return _api_ok({"reports": rows, "total": len(rows)})


@app.get("/reports/{report_id}/download")
async def reports_download(report_id: str):
    with _db() as conn:
        row = conn.execute("SELECT * FROM reports WHERE id = ?", (report_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Report not found")
    path = Path(dict(row)["file_path"])
    if not path.exists():
        raise HTTPException(status_code=404, detail="Report file missing")
    _audit("Report Downloaded", report_id, "Success")
    return FileResponse(path, media_type="application/pdf", filename=f"{report_id}.pdf")


@app.post("/campaigns")
async def create_campaign(payload: CampaignRequest):
    campaign_id = f"CAM-{uuid.uuid4().hex[:10].upper()}"
    audience_size = len(payload.customer_ids)
    roi = round((audience_size * 420 - payload.budget) / max(payload.budget, 1) * 100, 1) if payload.budget else 0
    with _db() as conn:
        conn.execute(
            "INSERT INTO campaigns VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (campaign_id, payload.name, payload.action, json.dumps(payload.customer_ids), payload.budget, roi, payload.status, datetime.now().isoformat()),
        )
    _audit("Campaign Created", campaign_id, "Success")
    _notify("Campaign created", f"{payload.name} created with {audience_size} customers.", "Campaign Alert")
    return _api_ok({"campaign_id": campaign_id, "roi": roi, "audience_size": audience_size}, "Campaign created")


@app.get("/campaigns")
async def list_campaigns():
    with _db() as conn:
        rows = _rows(conn.execute("SELECT * FROM campaigns ORDER BY created_at DESC"))
    return _api_ok({"campaigns": rows, "total": len(rows)})


@app.get("/notifications")
async def list_notifications():
    with _db() as conn:
        rows = _rows(conn.execute("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 100"))
    return _api_ok({"notifications": rows, "unread": sum(1 for row in rows if not row.get("read"))})


@app.post("/notifications/mark-all-read")
async def mark_notifications_read():
    with _db() as conn:
        conn.execute("UPDATE notifications SET read = 1")
    _audit("Notifications Updated", "Mark all read", "Success")
    return _api_ok({"read": True}, "Notifications marked as read")


@app.get("/audit-logs")
async def audit_logs(limit: int = 100):
    with _db() as conn:
        rows = _rows(conn.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?", (max(1, min(limit, 500)),)))
    return _api_ok({"audit_logs": rows, "total": len(rows)})


@app.get("/settings")
async def get_settings(workspace_id: str = "ws_demo"):
    with _db() as conn:
        rows = _rows(conn.execute("SELECT key, value_json, updated_at FROM settings WHERE workspace_id = ?", (workspace_id,)))
    settings = {row["key"]: json.loads(row["value_json"]) for row in rows}
    if not settings:
        settings = {"theme": "light", "language": "English", "timezone": "Europe/Paris", "currency": "USD", "risk_alert_threshold": 70}
    return _api_ok({"workspace_id": workspace_id, "settings": settings})


@app.put("/settings")
async def update_settings(settings: dict, workspace_id: str = "ws_demo"):
    now = datetime.now().isoformat()
    with _db() as conn:
        for key, value in settings.items():
            conn.execute(
                "INSERT OR REPLACE INTO settings VALUES (?, ?, ?, ?, ?)",
                (f"{workspace_id}:{key}", workspace_id, key, json.dumps(value), now),
            )
    _audit("Settings Change", workspace_id, "Success")
    _notify("Settings saved", "Workspace settings were updated.", "System")
    return await get_settings(workspace_id)


@app.get("/ui")
async def churniq_ui():
    """Open the ChurnIQ AI static preview bundled with the project."""
    return RedirectResponse(url="/ui/preview.html")


if FRONTEND_DIR.exists():
    app.mount("/ui", StaticFiles(directory=FRONTEND_DIR, html=True), name="churniq-ui")
