from typing import List, Dict, Optional
from ..schemas import TelemetryCreate

class AnomalyDetector:
    """Detect anomalies in telemetry data using statistical methods"""
    
    def __init__(self, threshold: float = 2.0):
        self.threshold = threshold  # Standard deviations for anomaly detection
    
    def calculate_statistics(self, values: List[float]) -> Dict:
        """Calculate mean and standard deviation"""
        if not values:
            return {"mean": 0, "std": 0}
        
        mean = sum(values) / len(values)
        variance = sum((x - mean) ** 2 for x in values) / len(values)
        std = variance ** 0.5
        
        return {"mean": mean, "std": std}
    
    def detect_anomalies(self, telemetry_list: List[TelemetryCreate], field: str) -> List[int]:
        """Detect anomalies in specific field"""
        if len(telemetry_list) < 3:
            return []
        
        values = [getattr(t, field) for t in telemetry_list]
        stats = self.calculate_statistics(values)
        
        anomalies = []
        for i, value in enumerate(values):
            z_score = abs(value - stats["mean"]) / stats["std"] if stats["std"] > 0 else 0
            if z_score > self.threshold:
                anomalies.append(i)
        
        return anomalies
    
    def is_anomalous(self, current: TelemetryCreate, historical: List[TelemetryCreate], field: str) -> bool:
        """Check if current reading is anomalous compared to history"""
        if len(historical) < 3:
            return False
        
        historical_values = [getattr(t, field) for t in historical]
        stats = self.calculate_statistics(historical_values)
        
        current_value = getattr(current, field)
        z_score = abs(current_value - stats["mean"]) / stats["std"] if stats["std"] > 0 else 0
        
        return z_score > self.threshold
    
    def get_anomaly_severity(self, value: float, mean: float, std: float) -> str:
        """Classify anomaly severity"""
        if std == 0:
            return "normal"
        
        z_score = abs(value - mean) / std
        
        if z_score > 4:
            return "critical"
        elif z_score > 3:
            return "high"
        elif z_score > 2:
            return "medium"
        elif z_score > 1:
            return "low"
        else:
            return "normal"
