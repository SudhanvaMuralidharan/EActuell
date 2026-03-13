from typing import Optional
import re

class Validators:
    """Input validation utilities"""
    
    @staticmethod
    def validate_device_id(device_id: str) -> bool:
        """Validate device ID format"""
        pattern = r'^[A-Z0-9_-]{3,20}$'
        return bool(re.match(pattern, device_id))
    
    @staticmethod
    def validate_coordinates(latitude: float, longitude: float) -> bool:
        """Validate GPS coordinates"""
        if not (-90 <= latitude <= 90):
            return False
        if not (-180 <= longitude <= 180):
            return False
        return True
    
    @staticmethod
    def validate_flow_percentage(flow: float) -> bool:
        """Validate flow percentage (0-100)"""
        return 0 <= flow <= 100
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @staticmethod
    def validate_phone(phone: Optional[str]) -> bool:
        """Validate phone number"""
        if not phone:
            return True  # Phone is optional
        
        # Remove common separators
        cleaned = re.sub(r'[\s\-\(\)\.]', '', phone)
        
        # Check if it's a valid number (10-15 digits)
        return cleaned.isdigit() and 10 <= len(cleaned) <= 15
    
    @staticmethod
    def validate_schedule_duration(minutes: int) -> bool:
        """Validate schedule duration (1-1440 minutes in a day)"""
        return 1 <= minutes <= 1440
    
    @staticmethod
    def validate_days_of_week(days: list) -> bool:
        """Validate days of week (0-6)"""
        if not isinstance(days, list):
            return False
        return all(0 <= day <= 6 for day in days)
