import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, classification_report

# -------------------- Load Dataset --------------------

data = pd.read_csv("data/survey lung cancer.csv")

# -------------------- Encode Categorical Columns --------------------

le = LabelEncoder()
data['GENDER'] = le.fit_transform(data['GENDER'])
data['LUNG_CANCER'] = le.fit_transform(data['LUNG_CANCER'])

# -------------------- Split Features & Target --------------------

X = data.drop('LUNG_CANCER', axis=1)
y = data['LUNG_CANCER']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -------------------- Feature Scaling --------------------

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# -------------------- Stage 1: Base Model --------------------

knn = KNeighborsClassifier(n_neighbors=5)
knn.fit(X_train, y_train)

y_pred = knn.predict(X_test)
base_accuracy = accuracy_score(y_test, y_pred)

print("Base Model Accuracy:", base_accuracy * 100)

# -------------------- Stage 2: Optimization --------------------

k_values = range(1, 21)
accuracy_list = []

for k in k_values:
    model = KNeighborsClassifier(n_neighbors=k, weights='distance')
    model.fit(X_train, y_train)
    pred = model.predict(X_test)
    acc = accuracy_score(y_test, pred)
    accuracy_list.append(acc)

best_k = k_values[np.argmax(accuracy_list)]
print("Best k value:", best_k)
print("Optimized Accuracy:", max(accuracy_list) * 100)

# -------------------- Final Optimized Model --------------------

knn_final = KNeighborsClassifier(n_neighbors=best_k, weights='distance')
knn_final.fit(X_train, y_train)

final_pred = knn_final.predict(X_test)
final_accuracy = accuracy_score(y_test, final_pred)

print("\nFinal Model Accuracy:", final_accuracy * 100)
print("\nClassification Report:\n")
print(classification_report(y_test, final_pred))

# -------------------- Save Model & Scaler --------------------

joblib.dump(knn_final, "model.pkl")
joblib.dump(scaler, "scaler.pkl")

print("\nModel and Scaler saved successfully.")
