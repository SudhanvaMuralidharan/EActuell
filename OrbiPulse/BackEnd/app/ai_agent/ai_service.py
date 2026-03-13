from sqlalchemy.orm import Session
from typing import List, Dict
from ..schemas import TelemetryCreate
from .telemetry_analyzer import TelemetryAnalyzer
from .anomaly_detector import AnomalyDetector
from .decision_engine import DecisionEngine

class AIService:
    """Main AI service that coordinates all AI components"""
    
    def __init__(self, db: Session):
        self.db = db
        self.analyzer = TelemetryAnalyzer()
        self.detector = AnomalyDetector()
        self.decision_engine = DecisionEngine()
    
    def analyze_valve_health(self, device_id: str) -> Dict:
        """Comprehensive health analysis for a valve"""
        from ..models.telemetry_model import TelemetryModel
        
        # Get recent telemetry
        telemetry_records = self.db.query(TelemetryModel).filter(
            TelemetryModel.device_id == device_id
        ).order_by(TelemetryModel.timestamp.desc()).limit(100).all()
        
        if not telemetry_records:
            return {"error": "No telemetry data available"}
        
        # Convert to schema objects
        telemetry_list = [TelemetryCreate(**t.__dict__) for t in telemetry_records]
        latest = telemetry_list[0]
        
        # Analyze trends
        trends = {
            "temperature": self.analyzer.analyze_trend(telemetry_list, "temperature"),
            "motor_current": self.analyzer.analyze_trend(telemetry_list, "motor_current"),
            "battery_voltage": self.analyzer.analyze_trend(telemetry_list, "battery_voltage"),
            "signal_strength": self.analyzer.analyze_trend(telemetry_list, "signal_strength"),
        }
        
        # Detect anomalies
        anomalies = {
            "temperature": self.detector.detect_anomalies(telemetry_list, "temperature"),
            "motor_current": self.detector.detect_anomalies(telemetry_list, "motor_current"),
        }
        
        # Calculate health score
        health_score = self.analyzer.get_health_score(latest)
        
        # Generate recommendations
        recommendations = self.decision_engine.generate_recommendations(latest)
        
        # Predict maintenance
        maintenance_needed = self.decision_engine.predict_maintenance_needed(telemetry_list)
        
        return {
            "device_id": device_id,
            "health_score": health_score,
            "latest_telemetry": latest.dict(),
            "trends": trends,
            "anomalies": anomalies,
            "recommendations": recommendations,
            "maintenance_needed": maintenance_needed
        }
    
    def get_fleet_insights(self) -> Dict:
        """Get insights across all valves"""
        from ..models.valve_model import ValveModel
        
        valves = self.db.query(ValveModel).all()
        
        total_valves = len(valves)
        healthy_count = 0
        warning_count = 0
        critical_count = 0
        
        for valve in valves:
            health = self.analyze_valve_health(valve.device_id)
            score = health.get("health_score", 0)
            
            if score >= 80:
                healthy_count += 1
            elif score >= 50:
                warning_count += 1
            else:
                critical_count += 1
        
        return {
            "total_valves": total_valves,
            "healthy": healthy_count,
            "warning": warning_count,
            "critical": critical_count,
            "fleet_health_percentage": round((healthy_count / total_valves * 100) if total_valves > 0 else 0, 2)
        }
    
    def generate_ai_report(self, device_id: str) -> str:
        """Generate human-readable AI report for a valve"""
        analysis = self.analyze_valve_health(device_id)
        
        if "error" in analysis:
            return analysis["error"]
        
        report = f"AI Health Report for Valve {device_id}\n"
        report += "=" * 50 + "\n\n"
        
        report += f"Overall Health Score: {analysis['health_score']}/100\n\n"
        
        report += "Trend Analysis:\n"
        for metric, trend in analysis['trends'].items():
            report += f"  - {metric.title()}: {trend['trend']} ({trend['change']}%)\n"
        
        report += "\nRecommendations:\n"
        if analysis['recommendations']:
            for rec in analysis['recommendations']:
                report += f"  [{rec['priority'].upper()}] {rec['message']}\n"
        else:
            report += "  No immediate actions required.\n"
        
        report += f"\nMaintenance Needed: {'Yes' if analysis['maintenance_needed'] else 'No'}\n"
        
        return report
