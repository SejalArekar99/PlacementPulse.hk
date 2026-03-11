import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

MODEL_PATH = "placement_model.pkl"

def train_mock_model():
    """
    Trains a mock Random Forest Classifier to predict placement probability.
    Features: [cgpa, internships, dsa_score, ats_score]
    """
    # Generate some mock data
    np.random.seed(42)
    # 500 samples
    n_samples = 500
    
    # Randomly generate features
    cgpa = np.random.uniform(5.0, 10.0, n_samples)
    internships = np.random.randint(0, 4, n_samples)
    dsa_score = np.random.uniform(0, 100, n_samples)
    ats_score = np.random.uniform(0, 100, n_samples)
    
    X = np.column_stack((cgpa, internships, dsa_score, ats_score))
    
    # Target label: 1 (Placed), 0 (Not Placed)
    # The higher the features, the higher the chance of being placed
    # Add some noise to realism
    score = (cgpa / 10) * 0.3 + (internships / 3) * 0.2 + (dsa_score / 100) * 0.25 + (ats_score / 100) * 0.25
    y = (score + np.random.normal(0, 0.1, n_samples) > 0.6).astype(int)
    
    # Train the model
    model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    model.fit(X, y)
    
    # Save the model
    joblib.dump(model, MODEL_PATH)
    print(f"Mock model trained and saved to {MODEL_PATH}")

def load_model():
    if not os.path.exists(MODEL_PATH):
        train_mock_model()
    return joblib.load(MODEL_PATH)

def predict_placement_probability(cgpa, internships, dsa_score, ats_score):
    """
    Predicts the probability of placement using the trained mock model.
    """
    model = load_model()
    # Predict probabilities, [0] is prob for 0, [1] is prob for 1
    features = np.array([[cgpa, internships, dsa_score, ats_score]])
    probability = model.predict_proba(features)[0][1] * 100
    
    # Cap to max 98%
    if probability > 98:
        probability = 98.0
        
    return round(probability, 2)

if __name__ == "__main__":
    train_mock_model()
