from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..ai_agent.ai_service import AIService
from typing import List

router = APIRouter(prefix="/ai", tags=["AI Analytics"])

@router.get("/valve/{device_id}/health")
def get_valve_health_analysis(device_id: str, db: Session = Depends(get_db)):
    """Get comprehensive AI health analysis for a valve"""
    ai_service = AIService(db)
    analysis = ai_service.analyze_valve_health(device_id)
    
    if "error" in analysis:
        raise HTTPException(status_code=404, detail=analysis["error"])
    
    return analysis

@router.get("/fleet/insights")
def get_fleet_insights(db: Session = Depends(get_db)):
    """Get AI-powered fleet insights"""
    ai_service = AIService(db)
    return ai_service.get_fleet_insights()

@router.get("/valve/{device_id}/report")
def generate_ai_report(device_id: str, db: Session = Depends(get_db)):
    """Generate human-readable AI report"""
    ai_service = AIService(db)
    report = ai_service.generate_ai_report(device_id)
    return {"report": report}
