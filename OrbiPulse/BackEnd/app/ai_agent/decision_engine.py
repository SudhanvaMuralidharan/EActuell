from typing import Dict, List
from ..schemas import TelemetryCreate
from .telemetry_analyzer import TelemetryAnalyzer
from .anomaly_detector import AnomalyDetector

class DecisionEngine:
    """Make intelligent decisions based on telemetry analysis"""
    
    def __init__(self):
        self.analyzer = TelemetryAnalyzer()
        self.detector = AnomalyDetector()
    
    def generate_recommendations(self, telemetry: TelemetryCreate) -> List[Dict]:
        """Generate actionable recommendations based on current telemetry"""
        recommendations = []
        
        # Check temperature
        if telemetry.temperature > 40:
            recommendations.append({
                "type": "warning",
                "category": "temperature",
                "message": "High temperature detected. Consider reducing operation load.",
                "priority": "high" if telemetry.temperature > 45 else "medium"
            })
        
        # Check battery
        if telemetry.battery_voltage < 12.0:
            recommendations.append({
                "type": "maintenance",
                "category": "battery",
                "message": "Battery voltage is low. Schedule maintenance or charging.",
                "priority": "high" if telemetry.battery_voltage < 11.5 else "medium"
            })
        
        # Check signal strength
        if telemetry.signal_strength < -85:
            recommendations.append({
                "type": "infrastructure",
                "category": "connectivity",
                "message": "Weak signal. Consider repositioning antenna or adding gateway.",
                "priority": "medium"
            })
        
        # Check motor current
        if telemetry.motor_current > 2.5:
            recommendations.append({
                "type": "maintenance",
                "category": "motor",
                "message": "High motor current. Check for mechanical issues or obstructions.",
                "priority": "high" if telemetry.motor_current > 3.0 else "medium"
            })
        
        return recommendations
    
    def optimize_valve_position(self, telemetry: TelemetryCreate, target_flow: float) -> float:
        """Suggest optimal valve position based on conditions"""
        current_position = telemetry.valve_position
        
        # If battery is low, minimize movement
        if telemetry.battery_voltage < 11.5:
            return current_position  # Don't change position to save battery
        
        # Simple optimization logic (can be enhanced with ML)
        if target_flow > current_position + 10:
            return min(target_flow, current_position + 20)  # Gradual increase
        elif target_flow < current_position - 10:
            return max(target_flow, current_position - 20)  # Gradual decrease
        
        return current_position
    
    def predict_maintenance_needed(self, telemetry_history: List[TelemetryCreate]) -> bool:
        """Predict if maintenance is needed based on historical data"""
        if not telemetry_history:
            return False
        
        # Check for deteriorating trends
        temp_trend = self.analyzer.analyze_trend(telemetry_history, "temperature")
        motor_trend = self.analyzer.analyze_trend(telemetry_history, "motor_current")
        
        # Maintenance needed if temperature or motor current is increasing significantly
        if temp_trend["trend"] == "increasing" and temp_trend["change"] > 10:
            return True
        
        if motor_trend["trend"] == "increasing" and motor_trend["change"] > 15:
            return True
        
        # Check for recurring anomalies
        anomalies = self.detector.detect_anomalies(telemetry_history, "motor_current")
        if len(anomalies) > len(telemetry_history) * 0.3:  # More than 30% anomalous readings
            return True
        
        return False
