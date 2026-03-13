// OrbiPulse Mock Dataset — 20 Valves + 3 Gateways
// Simulates orbipulse_network_dataset_20v_3gw.json

import { COLORS } from '../constants/colors';

export type ValveStatus = 'open' | 'closed' | 'partial' | 'fault' | 'offline';

export interface Valve {
  device_id: string;
  name: string;
  gateway_id: string;
  lat: number;
  lng: number;
  valve_position: number;      // 0–100 %
  status: ValveStatus;
  battery_voltage: number;     // V
  motor_current: number;       // A
  internal_temp: number;       // °C
  signal_strength: number;     // dBm
  movement_duration: number;   // ms last move
  last_seen: string;           // ISO timestamp
  zone: string;
}

export interface Gateway {
  gateway_id: string;
  name: string;
  lat: number;
  lng: number;
  connected_valves: number;
  signal_strength: number;
  uptime_hours: number;
  last_seen: string;
}

export interface IrrigationSchedule {
  id: string;
  valve_id: string;
  valve_name: string;
  start_time: string;    // "HH:MM"
  duration_minutes: number;
  days: string[];        // ['Mon', 'Wed', 'Fri']
  enabled: boolean;
  created_at: string;
}

export interface TelemetryPoint {
  timestamp: string;
  value: number;
}

// ─── Gateways ────────────────────────────────────────────────────────────────
export const GATEWAYS: Gateway[] = [
  {
    gateway_id: 'GW-001',
    name: 'North Farm Hub',
    lat: 14.6790,
    lng: 75.9230,
    connected_valves: 7,
    signal_strength: -62,
    uptime_hours: 312,
    last_seen: new Date().toISOString(),
  },
  {
    gateway_id: 'GW-002',
    name: 'Central Hub',
    lat: 14.6650,
    lng: 75.9360,
    connected_valves: 7,
    signal_strength: -58,
    uptime_hours: 289,
    last_seen: new Date().toISOString(),
  },
  {
    gateway_id: 'GW-003',
    name: 'South Field Hub',
    lat: 14.6510,
    lng: 75.9210,
    connected_valves: 6,
    signal_strength: -71,
    uptime_hours: 201,
    last_seen: new Date().toISOString(),
  },
];

// ─── Valves ───────────────────────────────────────────────────────────────────
export const VALVES: Valve[] = [
  // GW-001 cluster
  { device_id: 'V-001', name: 'Field A — Inlet',   gateway_id: 'GW-001', lat: 14.6820, lng: 75.9180, valve_position: 100, status: 'open',    battery_voltage: 3.9, motor_current: 1.2, internal_temp: 34, signal_strength: -65, movement_duration: 820,  last_seen: new Date().toISOString(), zone: 'Zone A' },
  { device_id: 'V-002', name: 'Field A — Mid',     gateway_id: 'GW-001', lat: 14.6835, lng: 75.9210, valve_position: 60,  status: 'partial', battery_voltage: 3.7, motor_current: 0.9, internal_temp: 36, signal_strength: -68, movement_duration: 950,  last_seen: new Date().toISOString(), zone: 'Zone A' },
  { device_id: 'V-003', name: 'Field A — Outlet',  gateway_id: 'GW-001', lat: 14.6845, lng: 75.9250, valve_position: 0,   status: 'closed',  battery_voltage: 3.8, motor_current: 0.0, internal_temp: 33, signal_strength: -70, movement_duration: 780,  last_seen: new Date().toISOString(), zone: 'Zone A' },
  { device_id: 'V-004', name: 'Field B — North',   gateway_id: 'GW-001', lat: 14.6760, lng: 75.9195, valve_position: 0,   status: 'fault',   battery_voltage: 3.2, motor_current: 2.8, internal_temp: 52, signal_strength: -72, movement_duration: 2400, last_seen: new Date(Date.now() - 3600000).toISOString(), zone: 'Zone B' },
  { device_id: 'V-005', name: 'Field B — South',   gateway_id: 'GW-001', lat: 14.6775, lng: 75.9220, valve_position: 100, status: 'open',    battery_voltage: 3.8, motor_current: 1.1, internal_temp: 35, signal_strength: -66, movement_duration: 830,  last_seen: new Date().toISOString(), zone: 'Zone B' },
  { device_id: 'V-006', name: 'Pump Main Feed',    gateway_id: 'GW-001', lat: 14.6800, lng: 75.9240, valve_position: 80,  status: 'partial', battery_voltage: 3.6, motor_current: 1.4, internal_temp: 38, signal_strength: -69, movement_duration: 910,  last_seen: new Date().toISOString(), zone: 'Zone B' },
  { device_id: 'V-007', name: 'North Tank Valve',  gateway_id: 'GW-001', lat: 14.6810, lng: 75.9260, valve_position: 0,   status: 'offline', battery_voltage: 3.0, motor_current: 0.0, internal_temp: 31, signal_strength: -89, movement_duration: 0,    last_seen: new Date(Date.now() - 86400000).toISOString(), zone: 'Zone A' },

  // GW-002 cluster
  { device_id: 'V-008', name: 'Drip Line 1',       gateway_id: 'GW-002', lat: 14.6670, lng: 75.9310, valve_position: 100, status: 'open',    battery_voltage: 3.9, motor_current: 1.0, internal_temp: 33, signal_strength: -60, movement_duration: 800,  last_seen: new Date().toISOString(), zone: 'Zone C' },
  { device_id: 'V-009', name: 'Drip Line 2',       gateway_id: 'GW-002', lat: 14.6685, lng: 75.9340, valve_position: 100, status: 'open',    battery_voltage: 3.8, motor_current: 1.1, internal_temp: 34, signal_strength: -62, movement_duration: 810,  last_seen: new Date().toISOString(), zone: 'Zone C' },
  { device_id: 'V-010', name: 'Drip Line 3',       gateway_id: 'GW-002', lat: 14.6695, lng: 75.9370, valve_position: 50,  status: 'partial', battery_voltage: 3.7, motor_current: 0.7, internal_temp: 35, signal_strength: -64, movement_duration: 870,  last_seen: new Date().toISOString(), zone: 'Zone C' },
  { device_id: 'V-011', name: 'Drip Line 4',       gateway_id: 'GW-002', lat: 14.6625, lng: 75.9320, valve_position: 0,   status: 'closed',  battery_voltage: 3.9, motor_current: 0.0, internal_temp: 32, signal_strength: -61, movement_duration: 790,  last_seen: new Date().toISOString(), zone: 'Zone D' },
  { device_id: 'V-012', name: 'Canal Junction A',  gateway_id: 'GW-002', lat: 14.6640, lng: 75.9350, valve_position: 0,   status: 'closed',  battery_voltage: 3.8, motor_current: 0.0, internal_temp: 33, signal_strength: -63, movement_duration: 805,  last_seen: new Date().toISOString(), zone: 'Zone D' },
  { device_id: 'V-013', name: 'Canal Junction B',  gateway_id: 'GW-002', lat: 14.6655, lng: 75.9380, valve_position: 70,  status: 'partial', battery_voltage: 3.6, motor_current: 1.3, internal_temp: 37, signal_strength: -67, movement_duration: 930,  last_seen: new Date().toISOString(), zone: 'Zone D' },
  { device_id: 'V-014', name: 'Central Bypass',    gateway_id: 'GW-002', lat: 14.6660, lng: 75.9410, valve_position: 0,   status: 'fault',   battery_voltage: 3.3, motor_current: 2.5, internal_temp: 49, signal_strength: -74, movement_duration: 2100, last_seen: new Date(Date.now() - 1800000).toISOString(), zone: 'Zone D' },

  // GW-003 cluster
  { device_id: 'V-015', name: 'South Field — E',   gateway_id: 'GW-003', lat: 14.6530, lng: 75.9190, valve_position: 100, status: 'open',    battery_voltage: 3.7, motor_current: 1.0, internal_temp: 36, signal_strength: -70, movement_duration: 850,  last_seen: new Date().toISOString(), zone: 'Zone E' },
  { device_id: 'V-016', name: 'South Field — W',   gateway_id: 'GW-003', lat: 14.6515, lng: 75.9220, valve_position: 0,   status: 'closed',  battery_voltage: 3.8, motor_current: 0.0, internal_temp: 34, signal_strength: -71, movement_duration: 820,  last_seen: new Date().toISOString(), zone: 'Zone E' },
  { device_id: 'V-017', name: 'Orchard Row 1',     gateway_id: 'GW-003', lat: 14.6490, lng: 75.9200, valve_position: 40,  status: 'partial', battery_voltage: 3.5, motor_current: 0.8, internal_temp: 37, signal_strength: -73, movement_duration: 960,  last_seen: new Date().toISOString(), zone: 'Zone F' },
  { device_id: 'V-018', name: 'Orchard Row 2',     gateway_id: 'GW-003', lat: 14.6475, lng: 75.9230, valve_position: 40,  status: 'partial', battery_voltage: 3.6, motor_current: 0.8, internal_temp: 36, signal_strength: -72, movement_duration: 940,  last_seen: new Date().toISOString(), zone: 'Zone F' },
  { device_id: 'V-019', name: 'Tail End Flush',    gateway_id: 'GW-003', lat: 14.6460, lng: 75.9215, valve_position: 0,   status: 'offline', battery_voltage: 2.8, motor_current: 0.0, internal_temp: 30, signal_strength: -92, movement_duration: 0,    last_seen: new Date(Date.now() - 172800000).toISOString(), zone: 'Zone F' },
  { device_id: 'V-020', name: 'South Reservoir',   gateway_id: 'GW-003', lat: 14.6545, lng: 75.9250, valve_position: 0,   status: 'closed',  battery_voltage: 3.9, motor_current: 0.0, internal_temp: 33, signal_strength: -68, movement_duration: 800,  last_seen: new Date().toISOString(), zone: 'Zone E' },
];

// ─── Irrigation Schedules ────────────────────────────────────────────────────
export const INITIAL_SCHEDULES: IrrigationSchedule[] = [
  { id: 'S-001', valve_id: 'V-001', valve_name: 'Field A — Inlet',  start_time: '06:00', duration_minutes: 45, days: ['Mon','Wed','Fri'], enabled: true,  created_at: new Date().toISOString() },
  { id: 'S-002', valve_id: 'V-008', valve_name: 'Drip Line 1',      start_time: '07:30', duration_minutes: 30, days: ['Tue','Thu','Sat'], enabled: true,  created_at: new Date().toISOString() },
  { id: 'S-003', valve_id: 'V-015', valve_name: 'South Field — E',  start_time: '05:30', duration_minutes: 60, days: ['Mon','Tue','Wed','Thu','Fri'], enabled: false, created_at: new Date().toISOString() },
  { id: 'S-004', valve_id: 'V-017', valve_name: 'Orchard Row 1',    start_time: '18:00', duration_minutes: 20, days: ['Sat','Sun'],        enabled: true,  created_at: new Date().toISOString() },
];

// ─── Telemetry History (sparkline data) ─────────────────────────────────────
export function generateTelemetryHistory(
  baseValue: number,
  variance: number,
  points = 12,
): TelemetryPoint[] {
  const now = Date.now();
  return Array.from({ length: points }, (_, i) => ({
    timestamp: new Date(now - (points - 1 - i) * 5 * 60 * 1000).toISOString(),
    value: Math.max(0, baseValue + (Math.random() - 0.5) * variance * 2),
  }));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function getStatusColor(status: ValveStatus): string {
  switch (status) {
    case 'open':    return COLORS.valveOpen;
    case 'partial': return COLORS.valvePartial;
    case 'closed':  return COLORS.valveClosed;
    case 'fault':   return COLORS.valveFault;
    case 'offline': return COLORS.valveOffline;
    default:        return COLORS.valveOffline;
  }
}

export function getBatteryColor(voltage: number): string {
  if (voltage >= 3.7) return COLORS.success;
  if (voltage >= 3.4) return COLORS.warning;
  return COLORS.danger;
}

export function getSignalIcon(dbm: number): string {
  if (dbm > -65) return '▲▲▲';
  if (dbm > -75) return '▲▲';
  return '▲';
}

export function formatLastSeen(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
