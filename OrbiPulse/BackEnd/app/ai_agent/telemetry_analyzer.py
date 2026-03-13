from typing import List, Dict
from ..schemas import TelemetryCreate

class TelemetryAnalyzer:
    """Analyze telemetry data for patterns and trends"""
    
    def __init__(self):
        self.baseline_thresholds = {
            "temperature": 45.0,
            "motor_current": 3.0,
            "battery_voltage": 11.5,
            "signal_strength": -90.0,
        }
    
    def analyze_trend(self, telemetry_list: List[TelemetryCreate], field: str) -> Dict:
        """Analyze trend for specific field"""
        if not telemetry_list:
            return {"trend": "unknown", "change": 0}
        
        values = [getattr(t, field) for t in telemetry_list]
        
        if len(values) < 2:
            return {"trend": "stable", "change": 0}
        
        # Calculate simple trend
        avg_first_half = sum(values[:len(values)//2]) / (len(values)//2)
        avg_second_half = sum(values[len(values)//2:]) / (len(values) - len(values)//2)
        
        change_percent = ((avg_second_half - avg_first_half) / avg_first_half) * 100 if avg_first_half else 0
        
        if change_percent > 5:
            trend = "increasing"
        elif change_percent < -5:
            trend = "decreasing"
        else:
            trend = "stable"
        
        return {
            "trend": trend,
            "change": round(change_percent, 2),
            "average": round(sum(values) / len(values), 2),
            "min": round(min(values), 2),
            "max": round(max(values), 2)
        }
    
    def get_health_score(self, telemetry: TelemetryCreate) -> float:
        """Calculate overall health score (0-100)"""
        score = 100.0
        
        # Deduct points for each issue
        if telemetry.temperature > self.baseline_thresholds["temperature"]:
            score -= 20
        if telemetry.motor_current > self.baseline_thresholds["motor_current"]:
            score -= 20
        if telemetry.battery_voltage < self.baseline_thresholds["battery_voltage"]:
            score -= 15
        if telemetry.signal_strength < self.baseline_thresholds["signal_strength"]:
            score -= 10
        
        return max(0, min(100, score))
