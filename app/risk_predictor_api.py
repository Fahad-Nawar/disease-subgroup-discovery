import os
import glob
import pickle

import numpy as np
import pandas as pd
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler

app = Flask(__name__)
CORS(app)

MODEL_PATH = "models/gmm_3feature_bundle.pkl"   # 3-feature model
CSV_NAME   = "diet_recommendations_dataset (best).csv"
NUMERICAL  = ["BMI", "Glucose_mg/dL", "Blood_Pressure_mmHg"]   # 3 key biomarkers

def _find_csv():
    candidates = [f"data/{CSV_NAME}", f"../data/{CSV_NAME}", f"../../data/{CSV_NAME}", CSV_NAME]
    found = next((p for p in candidates if os.path.exists(p)), None)
    if found is None:
        hits = glob.glob(f"**/{CSV_NAME}", recursive=True)
        found = hits[0] if hits else None
    return found

def _load_or_train():
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            print("Model loaded from cache.")
            return pickle.load(f)

    csv_path = _find_csv()
    if csv_path is None:
        print("ERROR: CSV not found.")
        return None

    print(f"Training model from {csv_path} ...")
    df     = pd.read_csv(csv_path)
    labels = df["Disease_Type"].copy()
    scaler = StandardScaler()
    X      = scaler.fit_transform(df[NUMERICAL])
    gmm    = GaussianMixture(n_components=3, covariance_type="full", random_state=42, n_init=10)
    preds  = gmm.fit_predict(X)
    ct     = pd.crosstab(preds, labels)
    gmm_map = {c: ct.loc[c].idxmax() for c in ct.index}

    bundle = {"gmm": gmm, "scaler": scaler, "gmm_map": gmm_map}
    os.makedirs("models", exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(bundle, f)
    print("Model trained and saved.")
    return bundle

bundle = _load_or_train()

# ── serve frontend files ────────────────────────────────────────────────────
@app.route("/")
def index():
    return send_from_directory(".", "Health Predictor.html")

@app.route("/<path:filename>")
def static_files(filename):
    allowed = {"app.jsx", "screens.jsx", "tweaks-panel.jsx"}
    if filename in allowed:
        return send_from_directory(".", filename)
    return "Not found", 404

# ── prediction endpoint ─────────────────────────────────────────────────────
@app.route("/predict", methods=["POST"])
def predict():
    if bundle is None:
        return jsonify({"error": "Model not loaded. Check CSV path."}), 500

    v = request.json

    # 3-feature model: BMI, Glucose, Blood Pressure (systolic)
    x = np.array([[
        float(v["bmi"]),
        float(v["glucose"]),
        float(v["sbp"]),
    ]])

    x_scaled   = bundle["scaler"].transform(x)
    cluster    = int(bundle["gmm"].predict(x_scaled)[0])
    probs      = bundle["gmm"].predict_proba(x_scaled)[0]
    prediction = bundle["gmm_map"][cluster]

    prob_by_disease = {
        bundle["gmm_map"][i]: float(probs[i])
        for i in range(len(probs))
    }

    return jsonify({
        "prediction":    prediction,
        "probabilities": prob_by_disease,
        "confidence":    float(prob_by_disease[prediction]),
    })

@app.route("/health")
def health():
    return jsonify({"status": "ok", "model_loaded": bundle is not None})

if __name__ == "__main__":
    print("\n  Open in browser: http://localhost:5000\n")
    app.run(host="127.0.0.1", port=5000, debug=False)