// Database abstraction layer for IoT sensor data
// Supports multiple backends: Firebase, PostgreSQL, MongoDB, etc.

export interface SensorData {
  id: string;
  deviceId: string;
  timestamp: Date;
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

export interface DatabaseConfig {
  type: 'firebase' | 'postgresql' | 'mongodb' | 'thingspeak';
  connectionString?: string;
  apiKey?: string;
  projectId?: string;
}

export abstract class DatabaseAdapter {
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract saveSensorData(data: SensorData): Promise<string>;
  abstract getSensorData(deviceId?: string, limit?: number): Promise<SensorData[]>;
  abstract getHistoricalData(deviceId: string, hours: number): Promise<SensorData[]>;
  abstract getLatestReading(deviceId: string): Promise<SensorData | null>;
}

// Firebase Realtime Database Adapter
export class FirebaseAdapter extends DatabaseAdapter {
  private db: any;
  
  constructor(private config: DatabaseConfig) {
    super();
  }
  
  async connect(): Promise<void> {
    try {
      // Import Firebase dynamically to avoid SSR issues
      const { initializeApp, getApps } = await import('firebase/app');
      const { getDatabase } = await import('firebase/database');
      
      if (!getApps().length) {
        // Use actual Firebase configuration
        const firebaseConfig = {
          apiKey: this.config.apiKey || process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBLg8WtIG7awPNS0e6fiVdS1nZ0aBs3uDo",
          authDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "iot-aqi-353.firebaseapp.com",
          databaseURL: this.config.connectionString || process.env.FIREBASE_DATABASE_URL || process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://iot-aqi-353-default-rtdb.firebaseio.com",
          projectId: this.config.projectId || process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "iot-aqi-353",
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "iot-aqi-353.firebasestorage.app",
          messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "977654360050",
          appId: process.env.FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:977654360050:web:b620ea0ab31567daaaed6b",
          measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-TPFCQC70H8"
        };
        const app = initializeApp(firebaseConfig);
        this.db = getDatabase(app);
      } else {
        this.db = getDatabase();
      }
      
      console.log('Connected to Firebase Realtime Database:', this.config.projectId || "iot-aqi-353");
    } catch (error) {
      console.error('Failed to connect to Firebase:', error);
      throw error; // Throw error so we know if connection fails
    }
  }
  
  async disconnect(): Promise<void> {
    // Firebase handles connection management automatically
  }
  
  async saveSensorData(data: SensorData): Promise<string> {
    const { ref, set } = await import('firebase/database');
    const dataRef = ref(this.db, `sensors/${data.deviceId}/${data.id}`);
    await set(dataRef, {
      ...data,
      timestamp: data.timestamp.toISOString()
    });
    return data.id;
  }
  
  async getSensorData(deviceId?: string, limit: number = 100): Promise<SensorData[]> {
    const { ref, get } = await import('firebase/database');
    
    const path = deviceId ? `sensors/${deviceId}` : 'sensors';
    const dataRef = ref(this.db, path);
    
    const snapshot = await get(dataRef);
    const data: SensorData[] = [];
    
    if (snapshot.exists()) {
      const value = snapshot.val();
      
      if (deviceId) {
        // Handle single device
        Object.values(value).forEach((reading: any) => {
          data.push({
            ...reading,
            timestamp: new Date(reading.timestamp)
          });
        });
      } else {
        // Handle multiple devices
        Object.values(value).forEach((deviceData: any) => {
          Object.values(deviceData).forEach((reading: any) => {
            data.push({
              ...reading,
              timestamp: new Date(reading.timestamp)
            });
          });
        });
      }
    }
    
    // Sort by timestamp and limit results
    return data
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  async getHistoricalData(deviceId: string, hours: number): Promise<SensorData[]> {
    const { ref, get, query, orderByChild, startAt } = await import('firebase/database');
    
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    const dataRef = ref(this.db, `sensors/${deviceId}`);
    const dataQuery = query(dataRef, orderByChild('timestamp'), startAt(startTime.toISOString()));
    
    const snapshot = await get(dataQuery);
    const data: SensorData[] = [];
    
    snapshot.forEach((childSnapshot) => {
      const value = childSnapshot.val();
      data.push({
        ...value,
        timestamp: new Date(value.timestamp)
      });
    });
    
    return data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  async getLatestReading(deviceId: string): Promise<SensorData | null> {
    const { ref, get, query, orderByChild, limitToLast } = await import('firebase/database');
    
    try {
      // First try to get data without ordering (to avoid index issues)
      const dataRef = ref(this.db, `sensors/${deviceId}`);
      const snapshot = await get(dataRef);
      
      if (!snapshot.exists()) {
        console.log(`No data found for device: ${deviceId}`);
        return null;
      }
      
      const data = snapshot.val();
      let latestData: SensorData | null = null;
      let latestTimestamp = 0;
      
      // Manually find the latest reading
      Object.values(data).forEach((reading: any) => {
        const timestamp = new Date(reading.timestamp).getTime();
        if (timestamp > latestTimestamp) {
          latestTimestamp = timestamp;
          latestData = {
            ...reading,
            timestamp: new Date(reading.timestamp)
          };
        }
      });
      
      return latestData;
    } catch (error) {
      console.error(`Error fetching latest reading for ${deviceId}:`, error);
      throw error;
    }
  }
}

// ThingSpeak Adapter (for existing ThingSpeak integrations)
export class ThingSpeakAdapter extends DatabaseAdapter {
  constructor(private config: DatabaseConfig) {
    super();
  }
  
  async connect(): Promise<void> {
    // ThingSpeak is HTTP-based, no persistent connection needed
    console.log('ThingSpeak adapter initialized');
  }
  
  async disconnect(): Promise<void> {
    // No connection to close
  }
  
  async saveSensorData(data: SensorData): Promise<string> {
    // Send data to ThingSpeak channel
    const params = new URLSearchParams({
      api_key: this.config.apiKey!,
      field1: data.aqi.toString(),
      field2: data.co2.toString(),
      field3: data.pm25.toString(),
      field4: data.temperature.toString(),
      field5: data.humidity.toString(),
      field6: data.voc.toString(),
      field7: data.co.toString(),
      field8: data.no2.toString(),
    });
    
    const response = await fetch('https://api.thingspeak.com/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });
    
    const result = await response.text();
    return result;
  }
  
  async getSensorData(deviceId?: string, limit: number = 100): Promise<SensorData[]> {
    // Fetch from ThingSpeak channel
    const url = `${this.config.connectionString}?results=${limit}`;
    const response = await fetch(url);
    const data = await response.json();
    
    return data.feeds.map((feed: any, index: number) => ({
      id: `thingspeak_${feed.entry_id}`,
      deviceId: deviceId || 'thingspeak_device',
      timestamp: new Date(feed.created_at),
      aqi: parseFloat(feed.field1) || 0,
      co2: parseFloat(feed.field2) || 0,
      pm25: parseFloat(feed.field3) || 0,
      temperature: parseFloat(feed.field4) || 0,
      humidity: parseFloat(feed.field5) || 0,
      voc: parseFloat(feed.field6) || 0,
      co: parseFloat(feed.field7) || 0,
      no2: parseFloat(feed.field8) || 0,
      location: 'ThingSpeak Device'
    }));
  }
  
  async getHistoricalData(deviceId: string, hours: number): Promise<SensorData[]> {
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    const url = `${this.config.connectionString}?start=${startTime.toISOString()}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    return data.feeds.map((feed: any) => ({
      id: `thingspeak_${feed.entry_id}`,
      deviceId,
      timestamp: new Date(feed.created_at),
      aqi: parseFloat(feed.field1) || 0,
      co2: parseFloat(feed.field2) || 0,
      pm25: parseFloat(feed.field3) || 0,
      temperature: parseFloat(feed.field4) || 0,
      humidity: parseFloat(feed.field5) || 0,
      voc: parseFloat(feed.field6) || 0,
      co: parseFloat(feed.field7) || 0,
      no2: parseFloat(feed.field8) || 0,
      location: 'ThingSpeak Device'
    }));
  }
  
  async getLatestReading(deviceId: string): Promise<SensorData | null> {
    const data = await this.getSensorData(deviceId, 1);
    return data.length > 0 ? data[0] : null;
  }
}

// Database factory
export function createDatabaseAdapter(config: DatabaseConfig): DatabaseAdapter {
  switch (config.type) {
    case 'firebase':
      return new FirebaseAdapter(config);
    case 'thingspeak':
      return new ThingSpeakAdapter(config);
    default:
      throw new Error(`Unsupported database type: ${config.type}`);
  }
}

// Singleton database instance
let dbInstance: DatabaseAdapter | null = null;

export async function getDatabase(): Promise<DatabaseAdapter> {
  if (!dbInstance) {
    const config: DatabaseConfig = {
      type: (process.env.DATABASE_TYPE as any) || 'firebase',
      connectionString: process.env.FIREBASE_DATABASE_URL || process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://iot-aqi-353-default-rtdb.firebaseio.com",
      apiKey: process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBLg8WtIG7awPNS0e6fiVdS1nZ0aBs3uDo",
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "iot-aqi-353"
    };
    
    dbInstance = createDatabaseAdapter(config);
    await dbInstance.connect();
  }
  
  return dbInstance;
}