"use client";

import { useState, useEffect, useCallback } from 'react';

export interface SensorReading {
  id: string;
  timestamp: string;
  aqi: number;
  co2: number;
  pm25: number;
  voc: number;
  co: number;
  no2: number;
  temperature: number;
  humidity: number;
  location: string;
}

export interface UseSensorDataOptions {
  deviceId?: string;
  refreshInterval?: number; // in milliseconds
  historical?: boolean;
  autoRefresh?: boolean;
}

export interface UseSensorDataReturn {
  data: SensorReading | SensorReading[] | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  isConnected: boolean;
}

export function useSensorData(options: UseSensorDataOptions = {}): UseSensorDataReturn {
  const {
    deviceId,
    refreshInterval = 30000, // 30 seconds default
    historical = false,
    autoRefresh = true
  } = options;

  const [data, setData] = useState<SensorReading | SensorReading[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      
      const params = new URLSearchParams();
      if (deviceId) params.append('deviceId', deviceId);
      if (historical) params.append('historical', 'true');
      
      const response = await fetch(`/api/sensors?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setLastUpdated(new Date());
        setIsConnected(true);
      } else {
        throw new Error(result.error || 'Failed to fetch sensor data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setIsConnected(false);
      console.error('Error fetching sensor data:', err);
    } finally {
      setLoading(false);
    }
  }, [deviceId, historical]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchData, refreshInterval, autoRefresh]);

  // WebSocket connection for real-time updates (optional enhancement)
  useEffect(() => {
    if (!autoRefresh || historical) return;

    let ws: WebSocket | null = null;
    
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/sensors/websocket`;
        
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('WebSocket connected for real-time sensor data');
          setIsConnected(true);
        };
        
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'sensor-data') {
              setData(message.data);
              setLastUpdated(new Date());
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };
        
        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
          // Attempt to reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000);
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };
      } catch (err) {
        console.error('Failed to establish WebSocket connection:', err);
        // Fall back to polling if WebSocket fails
      }
    };

    // Only attempt WebSocket in browser environment
    if (typeof window !== 'undefined') {
      connectWebSocket();
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [autoRefresh, historical]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh: fetchData,
    isConnected
  };
}

// Hook for device management
export function useDevices() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/devices');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setDevices(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch devices');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching devices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const registerDevice = async (deviceData: any) => {
    try {
      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchDevices(); // Refresh device list
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error registering device:', err);
      throw err;
    }
  };

  const updateDevice = async (deviceId: string, updates: any) => {
    try {
      const response = await fetch('/api/devices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deviceId, ...updates })
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchDevices(); // Refresh device list
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error updating device:', err);
      throw err;
    }
  };

  return {
    devices,
    loading,
    error,
    refresh: fetchDevices,
    registerDevice,
    updateDevice
  };
}