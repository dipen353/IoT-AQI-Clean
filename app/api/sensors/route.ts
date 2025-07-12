import { NextRequest, NextResponse } from 'next/server';

// Mock sensor data structure - replace with real database/IoT platform integration
interface SensorReading {
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

// Simulate real-time sensor data
function generateRealtimeData(): SensorReading {
  const now = new Date().toISOString();
  
  // Generate realistic AQI values with some variation
  const baseAQI = 50 + Math.random() * 100;
  const aqi = Math.round(baseAQI);
  
  return {
    id: `sensor_${Date.now()}`,
    timestamp: now,
    aqi,
    co2: Math.round(400 + Math.random() * 800), // 400-1200 ppm
    pm25: Math.round(5 + Math.random() * 50), // 5-55 μg/m³
    voc: Math.round((0.1 + Math.random() * 0.8) * 100) / 100, // 0.1-0.9 mg/m³
    co: Math.round(2 + Math.random() * 15), // 2-17 ppm
    no2: Math.round(10 + Math.random() * 100), // 10-110 ppb
    temperature: Math.round((20 + Math.random() * 15) * 10) / 10, // 20-35°C
    humidity: Math.round(30 + Math.random() * 50), // 30-80%
    location: "ESP32_Device_001"
  };
}

// GET endpoint for current sensor readings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '1');
    const historical = searchParams.get('historical') === 'true';
    
    if (historical) {
      // Generate historical data for charts
      const historicalData = [];
      const now = new Date();
      
      for (let i = 23; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        historicalData.push({
          ...generateRealtimeData(),
          timestamp: timestamp.toISOString(),
          id: `historical_${timestamp.getTime()}`
        });
      }
      
      return NextResponse.json({
        success: true,
        data: historicalData,
        count: historicalData.length,
        type: 'historical'
      });
    }
    
    // Generate current readings
    const readings = Array.from({ length: count }, () => generateRealtimeData());
    
    return NextResponse.json({
      success: true,
      data: count === 1 ? readings[0] : readings,
      timestamp: new Date().toISOString(),
      type: 'realtime'
    });
    
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sensor data' },
      { status: 500 }
    );
  }
}

// POST endpoint for receiving sensor data (from ESP32 or other IoT devices)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate incoming sensor data
    const requiredFields = ['aqi', 'co2', 'pm25', 'temperature', 'humidity'];
    const missingFields = requiredFields.filter(field => !(field in body));
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }
    
    // Process and store the sensor data
    const sensorReading: SensorReading = {
      id: `sensor_${Date.now()}`,
      timestamp: new Date().toISOString(),
      aqi: Number(body.aqi),
      co2: Number(body.co2),
      pm25: Number(body.pm25),
      voc: Number(body.voc || 0),
      co: Number(body.co || 0),
      no2: Number(body.no2 || 0),
      temperature: Number(body.temperature),
      humidity: Number(body.humidity),
      location: body.location || 'Unknown'
    };
    
    // Here you would typically save to a database
    // For now, we'll just acknowledge receipt
    console.log('Received sensor data:', sensorReading);
    
    return NextResponse.json({
      success: true,
      message: 'Sensor data received successfully',
      id: sensorReading.id,
      timestamp: sensorReading.timestamp
    });
    
  } catch (error) {
    console.error('Error processing sensor data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process sensor data' },
      { status: 500 }
    );
  }
}