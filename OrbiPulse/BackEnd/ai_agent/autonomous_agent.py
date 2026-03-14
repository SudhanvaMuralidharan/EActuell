import asyncio
import logging
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config.database import SessionLocal
from models.database_models import ValveDB
from services.valve_service import control_valve
from ai_agent.ai_service import get_insights_for_valve
from ai_agent.anomaly_detector import AnomalyType

logger = logging.getLogger("autonomous_agent")
logger.setLevel(logging.INFO)

class AutonomousAgent:
    """
    Background agent that periodically monitors all valves and takes
    corrective actions based on AI-detected anomalies like high pressure.
    """
    def __init__(self, interval_seconds: int = 60):
        self.interval_seconds = interval_seconds
        self.is_running = False

    async def start(self):
        """Starts the background monitoring loop."""
        if self.is_running:
            return
        self.is_running = True
        logger.info(f"🤖 Autonomous AI Agent started (interval: {self.interval_seconds}s)")
        asyncio.create_task(self._run_loop())

    async def stop(self):
        """Stops the background monitoring loop."""
        self.is_running = False
        logger.info("🤖 Autonomous AI Agent stopping...")

    async def _run_loop(self):
        while self.is_running:
            try:
                await self._process_valves()
            except Exception as e:
                logger.error(f"Error in autonomous agent loop: {e}")
            await asyncio.sleep(self.interval_seconds)

    async def _process_valves(self):
        """Iterates over all active valves and checks for anomalies."""
        async with SessionLocal() as db:
            result = await db.execute(select(ValveDB))
            valves = result.scalars().all()
            
            for valve in valves:
                try:
                    await self._analyse_and_act(db, valve)
                except Exception as e:
                    logger.error(f"Error processing valve {valve.device_id}: {e}")

    async def _analyse_and_act(self, db: AsyncSession, valve: ValveDB):
        """Runs the AI pipeline for a valve and takes action if needed."""
        # Use existing AI insights
        insights = await get_insights_for_valve(db, valve.device_id, limit=20)
        
        anomalies = insights.get("anomalies", [])
        if not anomalies:
            return

        for anomaly in anomalies:
            anomaly_type = anomaly.get("type")
            
            # Action logic for Pressure/Flow
            if anomaly_type == AnomalyType.HIGH_PRESSURE:
                # Reduce pressure by 20% or close if extreme
                current_p = valve.valve_position or 100
                new_p = max(0, current_p - 20)
                
                logger.info(f"🚨 [AUTONOMOUS] High Pressure detected for {valve.device_id}. "
                            f"Reducing position: {current_p}% -> {new_p}%")
                
                await control_valve(db, valve.device_id, position=new_p)
                
            elif anomaly_type == AnomalyType.VALVE_BLOCKAGE:
                # Emergency close
                logger.warning(f"🚨 [AUTONOMOUS] Blockage detected for {valve.device_id}. Closing valve.")
                await control_valve(db, valve.device_id, action="close")

            elif anomaly_type == AnomalyType.FLOW_RATE_MISMATCH and anomaly.get("observed_value") > anomaly.get("threshold"):
                # Excessive flow detected
                current_p = valve.valve_position or 100
                new_p = max(0, current_p - 15)
                
                logger.info(f"🚨 [AUTONOMOUS] Excessive Flow detected for {valve.device_id}. "
                            f"Throttling: {current_p}% -> {new_p}%")
                
                await control_valve(db, valve.device_id, position=new_p)

# Global singleton
agent = AutonomousAgent(interval_seconds=60)
