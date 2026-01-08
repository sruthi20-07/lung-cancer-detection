from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import pyodbc
import os

app = FastAPI()

# ---------- ML PART ----------

model = joblib.load("model.pkl")
scaler = joblib.load("scaler.pkl")

EXPECTED_FEATURES = scaler.n_features_in_

class PatientData(BaseModel):
    features: list[float]
    name: str
    age: int
    symptoms: str

# ---------- DATABASE ----------

def get_connection():
    try:
        return pyodbc.connect(os.environ["AZURE_SQL_CONN"])
    except:
        return None  # allow demo without DB

# ---------- ROUTES ----------

@app.get("/")
def home():
    return {"message": "LungShield API running"}

@app.post("/predict")
def predict(data: PatientData):

    if len(data.features) != EXPECTED_FEATURES:
        raise HTTPException(
            status_code=422,
            detail=f"Model expects {EXPECTED_FEATURES} features, but received {len(data.features)}"
        )

    try:
        sample = np.array(data.features).reshape(1, -1)
        sample = scaler.transform(sample)
        prediction = model.predict(sample)
        result = "High Risk" if prediction[0] == 1 else "Low Risk"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

    db_status = "skipped"

    conn = get_connection()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO Patients (name, age, symptoms, prediction)
                VALUES (?, ?, ?, ?)
            """, data.name, data.age, data.symptoms, result)
            conn.commit()
            conn.close()
            db_status = "saved"
        except:
            db_status = "failed"

    return {
        "prediction": result,
        "expected_features": EXPECTED_FEATURES,
        "database_status": db_status
    }
