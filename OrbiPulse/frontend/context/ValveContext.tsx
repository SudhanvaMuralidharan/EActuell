import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VALVES, Valve, ValveStatus } from '../data/mockData';

export interface ValveState {
  position: number;
  status: ValveStatus;
  pending: boolean;
  lastCmd?: string;
  lastCmdTime?: string;
}

interface ValveContextType {
  valves: Valve[];
  states: Record<string, ValveState>;
  cmdLog: string[];
  sendCommand: (valveId: string, command: string, newPosition: number, newStatus: ValveStatus) => void;
  openValve: (valveId: string) => void;
  closeValve: (valveId: string) => void;
  setValvePosition: (valveId: string, position: number) => void;
  addValve: (newValve: Valve) => Promise<void>;
  openCount: number;
  faultCount: number;
  offlineCount: number;
}

const ValveContext = createContext<ValveContextType | undefined>(undefined);

const VALVES_STORAGE_KEY = '@orbipulse_valves';

export function ValveProvider({ children }: { children: ReactNode }) {
  const [valves, setValves] = useState<Valve[]>([]);
  const [states, setStates] = useState<Record<string, ValveState>>({});
  const [cmdLog, setCmdLog] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load valves from storage or initial mock data
  useEffect(() => {
    const loadValves = async () => {
      try {
        const stored = await AsyncStorage.getItem(VALVES_STORAGE_KEY);
        let currentValves = VALVES;
        if (stored) {
          currentValves = JSON.parse(stored);
        } else {
          await AsyncStorage.setItem(VALVES_STORAGE_KEY, JSON.stringify(VALVES));
        }
        
        setValves(currentValves);
        
        // Init states
        const init: Record<string, ValveState> = {};
        currentValves.forEach((v) => {
          init[v.device_id] = {
            position: v.valve_position,
            status: v.status,
            pending: false,
          };
        });
        setStates(init);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to load valves:', error);
        setValves(VALVES);
        setIsInitialized(true);
      }
    };

    loadValves();
  }, []);

  const sendCommand = (
    valveId: string,
    command: string,
    newPosition: number,
    newStatus: ValveStatus,
  ) => {
    const valve = valves.find((v) => v.device_id === valveId);
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
          position: success ? newPosition : (prev[valveId]?.position ?? 0),
          status: success ? newStatus : (prev[valveId]?.status ?? 'closed'),
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

  const addValve = async (newValve: Valve) => {
    const updatedValves = [newValve, ...valves];
    setValves(updatedValves);
    setStates((prev) => ({
      ...prev,
      [newValve.device_id]: {
        position: newValve.valve_position,
        status: newValve.status,
        pending: false,
      },
    }));
    await AsyncStorage.setItem(VALVES_STORAGE_KEY, JSON.stringify(updatedValves));
  };

  const openCount = Object.values(states).filter(s => s.status === 'open').length;
  const faultCount = Object.values(states).filter(s => s.status === 'fault').length;
  const offlineCount = Object.values(states).filter(s => s.status === 'offline').length;

  return (
    <ValveContext.Provider value={{ 
      valves,
      states, 
      cmdLog, 
      sendCommand, 
      openValve, 
      closeValve, 
      setValvePosition,
      addValve,
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
