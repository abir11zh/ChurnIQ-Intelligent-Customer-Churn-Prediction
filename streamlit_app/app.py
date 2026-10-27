"""
Streamlit Dashboard — Telco Churn Prediction
=============================================
Run: streamlit run streamlit_app/app.py
"""
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import json
import streamlit as st
import pandas as pd
import numpy as np
import joblib
import plotly.express as px
import plotly.graph_objects as go

from src.config import MODEL_PATH, THRESHOLD_PATH, RISK_THRESHOLDS
from src.inference import predict_single, classify_risk

# ─── Page Config ─────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Telco Churn Prediction",
    page_icon="",
    layout="wide",
)

# ─── Load Model ─────────────────────────────────────────────────────────────
@st.cache_resource
def load_model():
    try:
        model = joblib.load(MODEL_PATH)
        with open(THRESHOLD_PATH) as f:
            config = json.load(f)
        return model, config
    except Exception as e:
        st.error(f" Model not found. Run `python run_training.py` first.\n\nError: {e}")
        return None, None

model, config = load_model()

# ─── Header ──────────────────────────────────────────────────────────────────
st.title(" Telco Customer Churn Prediction")
st.markdown("### Production-Ready ML Dashboard")

if model is None:
    st.stop()

st.markdown(f"""
**Model**: {config.get('model', 'N/A')} | 
**Version**: {config.get('version', 'N/A')} | 
**Threshold**: {config.get('threshold', 0.5):.2f}
""")

# ─── Sidebar: Customer Input ────────────────────────────────────────────────
st.sidebar.header(" Customer Information")

tenure = st.sidebar.slider("Tenure (months)", 0, 72, 12)
monthly_charges = st.sidebar.slider("Monthly Charges ($)", 18.0, 120.0, 70.0)
total_charges = st.sidebar.number_input("Total Charges ($)", value=float(tenure * monthly_charges), min_value=0.0)

gender = st.sidebar.selectbox("Gender", ["Male", "Female"])
senior = st.sidebar.selectbox("Senior Citizen", ["No", "Yes"])
partner = st.sidebar.selectbox("Partner", ["No", "Yes"])
dependents = st.sidebar.selectbox("Dependents", ["No", "Yes"])

st.sidebar.header(" Services")
phone = st.sidebar.selectbox("Phone Service", ["Yes", "No"])
multiple_lines = st.sidebar.selectbox("Multiple Lines", ["No", "Yes", "No phone service"])
internet = st.sidebar.selectbox("Internet Service", ["Fiber optic", "DSL", "No"])
online_security = st.sidebar.selectbox("Online Security", ["No", "Yes", "No internet service"])
online_backup = st.sidebar.selectbox("Online Backup", ["No", "Yes", "No internet service"])
device_protection = st.sidebar.selectbox("Device Protection", ["No", "Yes", "No internet service"])
tech_support = st.sidebar.selectbox("Tech Support", ["No", "Yes", "No internet service"])
streaming_tv = st.sidebar.selectbox("Streaming TV", ["No", "Yes", "No internet service"])
streaming_movies = st.sidebar.selectbox("Streaming Movies", ["No", "Yes", "No internet service"])

st.sidebar.header(" Contract")
contract = st.sidebar.selectbox("Contract", ["Month-to-month", "One year", "Two year"])
paperless = st.sidebar.selectbox("Paperless Billing", ["Yes", "No"])
payment = st.sidebar.selectbox("Payment Method", [
    "Electronic check", "Mailed check",
    "Bank transfer (automatic)", "Credit card (automatic)"
])

# ─── Build customer dict ────────────────────────────────────────────────────
customer = {
    "tenure": tenure,
    "MonthlyCharges": monthly_charges,
    "TotalCharges": total_charges,
    "gender": gender,
    "SeniorCitizen": senior,
    "Partner": partner,
    "Dependents": dependents,
    "PhoneService": phone,
    "MultipleLines": multiple_lines,
    "InternetService": internet,
    "OnlineSecurity": online_security,
    "OnlineBackup": online_backup,
    "DeviceProtection": device_protection,
    "TechSupport": tech_support,
    "StreamingTV": streaming_tv,
    "StreamingMovies": streaming_movies,
    "Contract": contract,
    "PaperlessBilling": paperless,
    "PaymentMethod": payment,
}

# ─── Prediction ─────────────────────────────────────────────────────────────
if st.sidebar.button(" Predict Churn", type="primary"):
    try:
        result = predict_single(customer, model=model, config=config)
        
        # Main display
        col1, col2, col3, col4 = st.columns(4)
        
        prob = result["churn_probability"]
        risk = result["risk_level"]
        
        risk_color = {
            "LOW": "🟢", "MEDIUM": "🟡", "HIGH": "🟠", "CRITICAL": "🔴"
        }
        
        col1.metric("Churn Probability", f"{prob*100:.1f}%")
        col2.metric("Risk Level", f"{risk_color.get(risk, '⚪')} {risk}")
        col3.metric("Will Churn?", "YES ⚠️" if result["will_churn"] else "NO ✓")
        col4.metric("Confidence", f"{result['confidence']*100:.0f}%")
        
        # Risk gauge
        fig = go.Figure(go.Indicator(
            mode="gauge+number+delta",
            value=prob * 100,
            title={"text": "Churn Risk Score"},
            gauge={
                "axis": {"range": [0, 100]},
                "bar": {"color": "darkred" if prob > 0.7 else "darkorange" if prob > 0.5 else "gold" if prob > 0.3 else "green"},
                "steps": [
                    {"range": [0, 30], "color": "#d4edda"},
                    {"range": [30, 50], "color": "#fff3cd"},
                    {"range": [50, 70], "color": "#ffeaa7"},
                    {"range": [70, 100], "color": "#f8d7da"},
                ],
                "threshold": {
                    "line": {"color": "red", "width": 4},
                    "thickness": 0.75,
                    "value": config.get("threshold", 0.5) * 100,
                },
            },
        ))
        fig.update_layout(height=300)
        st.plotly_chart(fig, use_container_width=True)
        
        # Recommendation
        st.info(f"💡 **Recommendation:** {result['recommendation']}")
        
        # SHAP explanation (if available)
        try:
            import shap
            st.subheader(" Feature Impact (SHAP)")
            
            # Get the base model for SHAP
            if hasattr(model, "named_steps"):
                pre = model.named_steps["pre"]
                clf = model.named_steps["clf"]
                customer_df = pd.DataFrame([customer])
                from src.preprocessing import FeatureEngineer
                customer_df = FeatureEngineer().transform(customer_df)
                if "TotalCharges" in customer_df.columns:
                    customer_df = customer_df.drop(columns=["TotalCharges"])
                X_transformed = pre.transform(customer_df)
                
                explainer = shap.TreeExplainer(clf)
                shap_values = explainer.shap_values(X_transformed)
                
                if isinstance(shap_values, list):
                    sv = shap_values[1]
                else:
                    sv = shap_values
                
                # Get feature names
                feature_names = pre.get_feature_names_out()
                
                shap_df = pd.DataFrame({
                    "Feature": feature_names[:len(sv[0])],
                    "SHAP Value": sv[0],
                    "Abs SHAP": np.abs(sv[0])
                }).sort_values("Abs SHAP", ascending=False).head(10)
                
                fig_shap = px.bar(
                    shap_df, x="SHAP Value", y="Feature",
                    orientation="h", color="SHAP Value",
                    color_continuous_scale="RdBu_r",
                    title="Top 10 Feature Contributions"
                )
                fig_shap.update_layout(height=400, yaxis={"autorange": "reversed"})
                st.plotly_chart(fig_shap, use_container_width=True)
        except Exception as e:
            st.caption(f"SHAP visualization not available: {e}")
        
    except Exception as e:
        st.error(f"Prediction failed: {e}")
        st.exception(e)
else:
    st.info(" Configure customer profile in the sidebar and click **Predict Churn**")

# ─── Footer ─────────────────────────────────────────────────────────────────
st.markdown("---")
st.caption("Telco Churn Prediction System v2.0 — Production-Ready ML Pipeline")
