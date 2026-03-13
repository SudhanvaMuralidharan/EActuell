"""
Telemetry Data Generator for Smart Irrigation System
Generates realistic sensor data for testing and simulation
"""

import json
import random
from datetime import datetime, timedelta
from typing import List, Dict

class TelemetryGenerator:
    """Generate realistic telemetry data for valves"""
    
    def __init__(self, device_id: str):
        self.device_id = device_id
        self.base_values = {
            "valve_position": 50.0,
            "battery_voltage": 12.6,
            "motor_current": 1.5,
            "temperature": 35.0,
            "signal_strength": -75.0,
        }
    
    def generate_reading(self, timestamp: datetime = None) -> Dict:
        """Generate a single telemetry reading"""
        if timestamp is None:
            timestamp = datetime.utcnow()
        
        # Add realistic variation to base values
        valve_position = max(0, min(100, self.base_values["valve_position"] + random.uniform(-5, 5)))
        battery_voltage = max(10, min(14, self.base_values["battery_voltage"] + random.uniform(-0.2, 0.2)))
        motor_current = max(0, min(5, self.base_values["motor_current"] + random.uniform(-0.3, 0.3)))
        temperature = max(20, min(60, self.base_values["temperature"] + random.uniform(-2, 2)))
        signal_strength = max(-100, min(-50, self.base_values["signal_strength"] + random.uniform(-5, 5)))
        
        # Determine status based on values
        status = "normal"
        if temperature > 45 or motor_current > 3:
            status = "warning"
        elif battery_voltage < 11.5 or signal_strength < -90:
            status = "critical"
        
        return {
            "timestamp": timestamp.isoformat(),
            "device_id": self.device_id,
            "valve_position": round(valve_position, 2),
            "battery_voltage": round(battery_voltage, 2),
            "motor_current": round(motor_current, 2),
            "temperature": round(temperature, 2),
            "signal_strength": round(signal_strength, 2),
            "status": status
        }
    
    def generate_batch(self, count: int, interval_minutes: int = 5) -> List[Dict]:
        """Generate multiple readings with time intervals"""
        readings = []
        base_time = datetime.utcnow() - timedelta(minutes=count * interval_minutes)
        
        for i in range(count):
            timestamp = base_time + timedelta(minutes=i * interval_minutes)
            reading = self.generate_reading(timestamp)
            readings.append(reading)
            
            # Gradually change base values for realistic trends
            if i % 10 == 0:
                self.base_values["valve_position"] = max(0, min(100, self.base_values["valve_position"] + random.uniform(-10, 10)))
                self.base_values["temperature"] = max(25, min(50, self.base_values["temperature"] + random.uniform(-1, 1)))
        
        return readings
    
    def simulate_anomaly(self, anomaly_type: str) -> Dict:
        """Generate a reading with specific anomaly"""
        reading = self.generate_reading()
        
        if anomaly_type == "overheating":
            reading["temperature"] = random.uniform(50, 65)
            reading["status"] = "critical"
        elif anomaly_type == "low_battery":
            reading["battery_voltage"] = random.uniform(10.5, 11.4)
            reading["status"] = "critical"
        elif anomaly_type == "motor_overload":
            reading["motor_current"] = random.uniform(3.5, 5.0)
            reading["status"] = "critical"
        elif anomaly_type == "weak_signal":
            reading["signal_strength"] = random.uniform(-95, -85)
            reading["status"] = "warning"
        
        return reading


def generate_dataset(num_valves: int = 10, readings_per_valve: int = 100):
    """Generate complete dataset for multiple valves"""
    dataset = {"valves": [], "metadata": {"generated_at": datetime.utcnow().isoformat()}}
    
    for i in range(num_valves):
        device_id = f"VALVE_{i+1:03d}"
        generator = TelemetryGenerator(device_id)
        
        valve_data = {
            "device_id": device_id,
            "model_number": f"SMV-2024-{random.choice(['A', 'B', 'C'])}",
            "location": {
                "latitude": round(random.uniform(14.64, 14.69), 4),
                "longitude": round(random.uniform(75.91, 75.95), 4)
            },
            "telemetry": generator.generate_batch(readings_per_valve)
        }
        
        dataset["valves"].append(valve_data)
    
    return dataset


if __name__ == "__main__":
    # Generate sample dataset
    print("Generating telemetry dataset...")
    dataset = generate_dataset(num_valves=10, readings_per_valve=100)
    
    # Save to file
    output_file = "dataset/telemetry_data.json"
    with open(output_file, "w") as f:
        json.dump(dataset, f, indent=2)
    
    print(f"Dataset saved to {output_file}")
    print(f"Total valves: {len(dataset['valves'])}")
    print(f"Total readings: {sum(len(v['telemetry']) for v in dataset['valves'])}")
