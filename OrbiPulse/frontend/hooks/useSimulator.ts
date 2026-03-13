/**
 * useSimulator — Challenge 6
 * Continuously generates realistic valve + gateway telemetry
 * at a configurable interval. Other screens can import this
 * hook to get a "live feed" of mock telemetry messages.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { VALVES, GATEWAYS, Valve } from '../data/mockData';

export interface TelemetryMessage {
  ts: string;          // ISO timestamp
  device_id: string;
  type: 'telemetry' | 'alert' | 'ack';
  payload: {
    valve_position?: number;
    battery_voltage?: number;
    motor_current?: number;
    internal_temp?: number;
    signal_strength?: number;
    pump_state?: boolean;
    alert_code?: string;
    message?: string;
  };
}

interface SimulatorState {
  messages: TelemetryMessage[];
  isRunning: boolean;
  messageCount: number;
  alertCount: number;
}

// Drift a value randomly within ±range, clamped to [min, max]
function drift(val: number, range: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val + (Math.random() - 0.5) * range * 2));
}

// Random alert codes that might appear
const ALERT_CODES = [
  'BATTERY_LOW',
  'MOTOR_OVERCURRENT',
  'TEMP_HIGH',
  'SIGNAL_WEAK',
  'VALVE_STALL',
  'COMM_TIMEOUT',
];

export default function useSimulator(intervalMs = 2000) {
  const [state, setState] = useState<SimulatorState>({
    messages: [],
    isRunning: false,
    messageCount: 0,
    alertCount: 0,
  });

  // Mutable telemetry state per valve (avoids re-render on every drift)
  const liveValues = useRef<Record<string, Valve>>(
    Object.fromEntries(VALVES.map((v) => [v.device_id, { ...v }])),
  );

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateTick = useCallback(() => {
    const now = new Date().toISOString();
    const newMessages: TelemetryMessage[] = [];
    let alertCount = 0;

    // Pick a random subset of valves to emit telemetry for (3–6 per tick)
    const subset = [...VALVES]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3 + Math.floor(Math.random() * 4));

    subset.forEach((v) => {
      const live = liveValues.current[v.device_id];
      if (live.status === 'offline') return;

      // Drift values
      live.battery_voltage  = drift(live.battery_voltage,  0.02, 2.5, 4.2);
      live.motor_current    = drift(live.motor_current,    0.15, 0,   3.0);
      live.internal_temp    = drift(live.internal_temp,    0.5,  10,  65);
      live.signal_strength  = Math.round(drift(live.signal_strength, 1.5, -99, -40));

      // Simulate occasional valve movement
      if (Math.random() < 0.03) {
        live.valve_position = [0, 25, 50, 75, 100][Math.floor(Math.random() * 5)];
        live.status = live.valve_position === 0 ? 'closed'
          : live.valve_position === 100 ? 'open' : 'partial';
      }

      const msg: TelemetryMessage = {
        ts: now,
        device_id: live.device_id,
        type: 'telemetry',
        payload: {
          valve_position:  live.valve_position,
          battery_voltage: +live.battery_voltage.toFixed(3),
          motor_current:   +live.motor_current.toFixed(3),
          internal_temp:   +live.internal_temp.toFixed(1),
          signal_strength: live.signal_strength,
          pump_state:      Math.random() > 0.5,
        },
      };
      newMessages.push(msg);

      // 5% chance of emitting an alert
      if (Math.random() < 0.05) {
        const code = ALERT_CODES[Math.floor(Math.random() * ALERT_CODES.length)];
        newMessages.push({
          ts: now,
          device_id: live.device_id,
          type: 'alert',
          payload: {
            alert_code: code,
            message: `${live.device_id}: ${code.replace(/_/g, ' ')}`,
          },
        });
        alertCount++;
      }
    });

    // Gateway heartbeats (1 per tick)
    const gw = GATEWAYS[Math.floor(Math.random() * GATEWAYS.length)];
    newMessages.push({
      ts: now,
      device_id: gw.gateway_id,
      type: 'telemetry',
      payload: {
        signal_strength: Math.round(drift(gw.signal_strength, 2, -90, -40)),
      },
    });

    setState((prev) => ({
      isRunning: true,
      messages: [...newMessages, ...prev.messages].slice(0, 200),
      messageCount: prev.messageCount + newMessages.length,
      alertCount: prev.alertCount + alertCount,
    }));
  }, []);

  const start = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(generateTick, intervalMs);
    setState((prev) => ({ ...prev, isRunning: true }));
  }, [generateTick, intervalMs]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const clear = useCallback(() => {
    setState((prev) => ({ ...prev, messages: [], messageCount: 0, alertCount: 0 }));
  }, []);

  // Clean up on unmount
  useEffect(() => () => stop(), [stop]);

  return { ...state, start, stop, clear };
}
