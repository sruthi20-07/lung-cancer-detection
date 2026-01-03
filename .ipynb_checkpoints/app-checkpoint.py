from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI()

model = joblib.load("model.pkl")
scaler = joblib.load("scaler.pkl")

class PatientData(BaseModel):
    features: list[float]

@app.get("/")
def home():
    return {"message": "Lung Cancer Detection API is running"}

@app.post("/predict")
def predict(data: PatientData):
    sample = np.array(data.features).reshape(1, -1)
    sample = scaler.transform(sample)
    prediction = model.predict(sample)

    result = "High Risk" if prediction[0] == 1 else "Low Risk"
    return {"prediction": result}
