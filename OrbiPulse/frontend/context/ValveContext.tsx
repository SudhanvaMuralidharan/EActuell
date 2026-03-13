import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Alert } from 'react-native';
import { VALVES, Valve, ValveStatus } from '../data/mockData';

export interface ValveState {
  position: number;
  status: ValveStatus;
  pending: boolean;
  lastCmd?: string;
  lastCmdTime?: string;
}

interface ValveContextType {
  states: Record<string, ValveState>;
  cmdLog: string[];
  sendCommand: (valveId: string, command: string, newPosition: number, newStatus: ValveStatus) => void;
  openValve: (valveId: string) => void;
  closeValve: (valveId: string) => void;
  setValvePosition: (valveId: string, position: number) => void;
  openCount: number;
  faultCount: number;
  offlineCount: number;
}

const ValveContext = createContext<ValveContextType | undefined>(undefined);

function initStates(): Record<string, ValveState> {
  const init: Record<string, ValveState> = {};
  VALVES.forEach((v) => {
    init[v.device_id] = {
      position: v.valve_position,
      status: v.status,
      pending: false,
    };
  });
  return init;
}

export function ValveProvider({ children }: { children: ReactNode }) {
  const [states, setStates] = useState<Record<string, ValveState>>(initStates);
  const [cmdLog, setCmdLog] = useState<string[]>([]);

  const sendCommand = (
    valveId: string,
    command: string,
    newPosition: number,
    newStatus: ValveStatus,
  ) => {
    const valve = VALVES.find((v) => v.device_id === valveId);
    if (!valve) return;

    if (valve.status === 'offline' || valve.status === 'fault') {
      Alert.alert(
        'Command Blocked',
        `${valve.name} is ${valve.status}. Cannot send command.`,
        [{ text: 'OK' }],
      );
      return;
    }

    // Set pending
    setStates((prev) => ({
      ...prev,
      [valveId]: { ...prev[valveId], pending: true },
    }));

    const logEntry = `[${new Date().toLocaleTimeString()}] ${valveId} → ${command}`;
    setCmdLog((prev) => [logEntry, ...prev.slice(0, 19)]);

    // Simulate network round-trip (800–1500ms)
    const delay = 800 + Math.random() * 700;
    setTimeout(() => {
      const success = Math.random() > 0.08; // 92% success rate
      setStates((prev) => ({
        ...prev,
        [valveId]: {
          position: success ? newPosition : prev[valveId].position,
          status: success ? newStatus : prev[valveId].status,
          pending: false,
          lastCmd: command,
          lastCmdTime: new Date().toLocaleTimeString(),
        },
      }));
      const ackEntry = success
        ? `[${new Date().toLocaleTimeString()}] ✓ ACK: ${valveId} ${command}`
        : `[${new Date().toLocaleTimeString()}] ✗ NACK: ${valveId} ${command} — retry?`;
      setCmdLog((prev) => [ackEntry, ...prev.slice(0, 19)]);
    }, delay);
  };

  const openValve = (valveId: string) =>
    sendCommand(valveId, 'OPEN  100%', 100, 'open');

  const closeValve = (valveId: string) =>
    sendCommand(valveId, 'CLOSE 0%', 0, 'closed');

  const setValvePosition = (valveId: string, position: number) => {
    const pos = Math.round(position);
    const status: ValveStatus = pos === 100 ? 'open' : pos === 0 ? 'closed' : 'partial';
    sendCommand(valveId, `SET   ${pos}%`, pos, status);
  };

  const openCount = Object.values(states).filter(s => s.status === 'open').length;
  const faultCount = Object.values(states).filter(s => s.status === 'fault').length;
  const offlineCount = Object.values(states).filter(s => s.status === 'offline').length;

  return (
    <ValveContext.Provider value={{ 
      states, 
      cmdLog, 
      sendCommand, 
      openValve, 
      closeValve, 
      setValvePosition,
      openCount,
      faultCount,
      offlineCount
    }}>
      {children}
    </ValveContext.Provider>
  );
}

export function useValves() {
  const context = useContext(ValveContext);
  if (context === undefined) {
    throw new Error('useValves must be used within a ValveProvider');
  }
  return context;
}
