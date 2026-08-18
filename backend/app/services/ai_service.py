import logging
import random

logger = logging.getLogger(__name__)

def evaluate_donor_match(patient_data: dict, donor_data: dict, distance_km: float) -> float:
    """
    Stub for the AI matching model.
    In the future, this will load a trained model from ml/models/ and evaluate
    the likelihood of a successful donation based on historical data.
    
    For now, returns a baseline score based on distance and recency.
    """
    # Baseline logic
    score = 100.0
    
    # Distance penalty (lose points the further away)
    score -= distance_km * 0.5
    
    # Random factor to simulate AI variance until real model is integrated
    score += random.uniform(-5.0, 5.0)
    
    return max(0.0, min(99.9, round(score, 1)))
