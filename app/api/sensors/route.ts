import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');

    console.log('Fetching sensor data for device:', deviceId);

    // Dynamically import to avoid build issues
    const { getDatabase } = await import('../../../lib/database');

    // Get database instance
    const db = await getDatabase();

    if (deviceId === 'kitchen_sensor_demo') {
      // Generate mock data for kitchen sensor
      const mockData = {
        deviceId: 'kitchen_sensor_demo',
        aqi: Math.round(25 + Math.random() * 30), // Good to moderate AQI
        temperature: Math.round((22 + Math.random() * 8) * 10) / 10, // 22-30°C
        humidity: Math.round(45 + Math.random() * 20), // 45-65%
        co2: Math.round(400 + Math.random() * 200), // 400-600 ppm
        pm25: Math.round(8 + Math.random() * 12), // 8-20 μg/m³
        voc: Math.round((0.2 + Math.random() * 0.3) * 100) / 100, // 0.2-0.5 mg/m³
        co: Math.round(3 + Math.random() * 4), // 3-7 ppm
        no2: Math.round(20 + Math.random() * 25), // 20-45 ppb
        location: 'Smart Kitchen Monitor',
        timestamp: new Date().toISOString(),
        batteryLevel: Math.round(75 + Math.random() * 20), // 75-95%
        signalStrength: Math.round(-45 + Math.random() * 15) // -45 to -30 dBm
      };

      console.log('Generated mock data for kitchen sensor:', mockData);

      return NextResponse.json({
        success: true,
        data: mockData,
        source: 'mock',
        message: 'Mock data for demonstration'
      });
    }

    if (deviceId) {
      // Get latest reading for specific device
      try {
        const latestReading = await db.getLatestReading(deviceId);

        if (latestReading) {
          return NextResponse.json({
            success: true,
            data: latestReading,
            type: 'current',
            deviceId
          });
        } else {
          console.log(`No data found for device: ${deviceId}`);
          return NextResponse.json({
            success: false,
            error: `No data found for device ${deviceId}`,
            message: 'Device not found in database. Please ensure the device is sending data to Firebase.',
            deviceId
          }, { status: 404 });
        }
      } catch (dbError) {
        console.error('Database query error:', dbError);
        return NextResponse.json({
          success: false,
          error: 'Database query failed',
          message: 'Unable to fetch data from Firebase. Please check Firebase configuration and rules.',
          deviceId
        }, { status: 500 });
      }
    } else {
      // Get data for all devices
      try {
        const allData = await db.getSensorData(undefined, 50);

        if (allData.length > 0) {
          return NextResponse.json({
            success: true,
            data: allData,
            type: 'historical'
          });
        } else {
          console.log('No sensor data found in database');
          return NextResponse.json({
            success: false,
            error: 'No sensor data found',
            message: 'No data found in Firebase database. Please ensure your ESP32 devices are sending data.',
            data: []
          }, { status: 404 });
        }
      } catch (dbError) {
        console.error('Database query error:', dbError);
        return NextResponse.json({
          success: false,
          error: 'Database query failed',
          message: 'Unable to fetch data from Firebase. Please check Firebase configuration and rules.',
          data: []
        }, { status: 500 });
      }
    }

  } catch (error) {
    console.error('Error in sensors API:', error);

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please check server logs.'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sensorData = await request.json();

    // Validate required fields
    if (!sensorData.deviceId || sensorData.aqi === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: deviceId, aqi'
      }, { status: 400 });
    }

    // Dynamically import to avoid build issues
    const { getDatabase } = await import('../../../lib/database');

    // Get database instance
    const db = await getDatabase();

    // Save sensor data
    const savedData = {
      id: `${sensorData.deviceId}_${Date.now()}`,
      deviceId: sensorData.deviceId,
      timestamp: new Date(),
      aqi: Number(sensorData.aqi) || 0,
      co2: Number(sensorData.co2) || 0,
      pm25: Number(sensorData.pm25) || 0,
      voc: Number(sensorData.voc) || 0,
      co: Number(sensorData.co) || 0,
      no2: Number(sensorData.no2) || 0,
      temperature: Number(sensorData.temperature) || 0,
      humidity: Number(sensorData.humidity) || 0,
      location: sensorData.location || `${sensorData.deviceId.replace('Esp_', 'ESP32_')} Location`
    };

    await db.saveSensorData(savedData);

    console.log('Sensor data saved successfully:', savedData.id);

    return NextResponse.json({
      success: true,
      message: 'Sensor data saved successfully',
      id: savedData.id
    });

  } catch (error) {
    console.error('Error saving sensor data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save sensor data',
      message: 'Database write error. Please check Firebase configuration.'
    }, { status: 500 });
  }
}