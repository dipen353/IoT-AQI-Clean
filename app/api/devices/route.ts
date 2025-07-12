import { NextRequest, NextResponse } from 'next/server';

interface IoTDevice {
  id: string;
  name: string;
  type: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance';
  lastSeen: string;
  firmware: string;
  sensors: string[];
  batteryLevel?: number;
  signalStrength?: number;
}

// Mock device registry - replace with database
const mockDevices: IoTDevice[] = [
  {
    id: 'esp32_001',
    name: 'Living Room Monitor',
    type: 'ESP32-WROOM-32',
    location: 'Living Room',
    status: 'online',
    lastSeen: new Date().toISOString(),
    firmware: 'v2.1.0',
    sensors: ['MQ-135', 'MQ-3', 'DHT-11'],
    batteryLevel: 85,
    signalStrength: -45
  },
  {
    id: 'esp32_002',
    name: 'Bedroom Monitor',
    type: 'ESP32-WROOM-32',
    location: 'Bedroom',
    status: 'online',
    lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    firmware: 'v2.0.8',
    sensors: ['MQ-135', 'DHT-22'],
    batteryLevel: 92,
    signalStrength: -52
  },
  {
    id: 'esp32_003',
    name: 'Kitchen Monitor',
    type: 'ESP32-WROOM-32',
    location: 'Kitchen',
    status: 'offline',
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    firmware: 'v1.9.5',
    sensors: ['MQ-135', 'MQ-3', 'MQ-7'],
    batteryLevel: 23,
    signalStrength: -78
  }
];

// GET endpoint for device management
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('id');
    const status = searchParams.get('status');
    
    let devices = [...mockDevices];
    
    // Filter by device ID
    if (deviceId) {
      devices = devices.filter(device => device.id === deviceId);
      if (devices.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Device not found' },
          { status: 404 }
        );
      }
    }
    
    // Filter by status
    if (status) {
      devices = devices.filter(device => device.status === status);
    }
    
    // Update last seen for online devices
    devices = devices.map(device => ({
      ...device,
      lastSeen: device.status === 'online' ? new Date().toISOString() : device.lastSeen
    }));
    
    return NextResponse.json({
      success: true,
      data: deviceId ? devices[0] : devices,
      count: devices.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch devices' },
      { status: 500 }
    );
  }
}

// POST endpoint for device registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const requiredFields = ['id', 'name', 'type', 'location'];
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
    
    const newDevice: IoTDevice = {
      id: body.id,
      name: body.name,
      type: body.type,
      location: body.location,
      status: 'online',
      lastSeen: new Date().toISOString(),
      firmware: body.firmware || 'unknown',
      sensors: body.sensors || [],
      batteryLevel: body.batteryLevel,
      signalStrength: body.signalStrength
    };
    
    // In a real implementation, save to database
    console.log('Device registered:', newDevice);
    
    return NextResponse.json({
      success: true,
      message: 'Device registered successfully',
      device: newDevice
    });
    
  } catch (error) {
    console.error('Error registering device:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to register device' },
      { status: 500 }
    );
  }
}

// PUT endpoint for device updates
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Device ID is required' },
        { status: 400 }
      );
    }
    
    // In a real implementation, update in database
    console.log(`Device ${id} updated:`, updates);
    
    return NextResponse.json({
      success: true,
      message: 'Device updated successfully',
      deviceId: id,
      updates
    });
    
  } catch (error) {
    console.error('Error updating device:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update device' },
      { status: 500 }
    );
  }
}