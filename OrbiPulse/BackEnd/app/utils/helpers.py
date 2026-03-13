from datetime import datetime
from typing import List, Dict

class Helpers:
    """General helper utilities"""
    
    @staticmethod
    def format_timestamp(dt: datetime) -> str:
        """Format datetime to ISO string"""
        return dt.isoformat() if dt else None
    
    @staticmethod
    def parse_days_of_week(days_str: str) -> List[int]:
        """Parse days of week from JSON string"""
        import json
        try:
            return json.loads(days_str)
        except:
            return []
    
    @staticmethod
    def serialize_days_of_week(days: List[int]) -> str:
        """Serialize days of week to JSON string"""
        import json
        return json.dumps(days)
    
    @staticmethod
    def get_day_names(days: List[int]) -> List[str]:
        """Convert day numbers to day names"""
        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        return [day_names[d] for d in days if 0 <= d <= 6]
    
    @staticmethod
    def calculate_duration_minutes(start: datetime, end: datetime) -> int:
        """Calculate duration in minutes between two datetimes"""
        if not start or not end:
            return 0
        
        delta = end - start
        return int(delta.total_seconds() / 60)
    
    @staticmethod
    def is_within_schedule(start_time: datetime, end_time: datetime) -> bool:
        """Check if current time is within schedule"""
        now = datetime.utcnow()
        return start_time <= now <= end_time
    
    @staticmethod
    def round_to_decimal(value: float, places: int = 2) -> float:
        """Round to specified decimal places"""
        return round(value, places)
    
    @staticmethod
    def convert_celsius_to_fahrenheit(celsius: float) -> float:
        """Convert temperature from Celsius to Fahrenheit"""
        return (celsius * 9/5) + 32
    
    @staticmethod
    def convert_meters_to_feet(meters: float) -> float:
        """Convert distance from meters to feet"""
        return meters * 3.28084
