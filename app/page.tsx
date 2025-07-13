"use client"

import Link from "next/link"
import { ChevronRight, BarChart2, Sun, Droplets } from "lucide-react"
import { Card } from "@/components/ui/card"
import GasCard from "@/components/gas-card"
import AQIVisualization from "@/components/aqi-visualization"
import PollutantTrendsCard from "@/components/pollutant-trends-card"
import { useState, useEffect } from "react"
import { getAQIColor } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import RealtimeDataExample from "@/components/RealtimeDataExample"
import { useDevices } from "@/hooks/useSensorData"

const AQI_SCENARIOS = {
  good: {
    label: "Good",
    aqi: 38,
    co2: 420,
    pm25: 7,
    voc: 0.12,
    co: 3,
    no2: 18,
    temp: 24,
    humidity: 42,
    updated: "2 minutes ago",
    color: "green",
  },
  moderate: {
    label: "Moderate",
    aqi: 85,
    co2: 700,
    pm25: 22,
    voc: 0.32,
    co: 7,
    no2: 55,
    temp: 27,
    humidity: 55,
    updated: "5 minutes ago",
    color: "yellow",
  },
  unhealthy: {
    label: "Unhealthy",
    aqi: 142,
    co2: 1200,
    pm25: 48,
    voc: 0.7,
    co: 13,
    no2: 120,
    temp: 30,
    humidity: 68,
    updated: "1 minute ago",
    color: "red",
  },
}

export default function HomePage() {
  const [scenario, setScenario] = useState<keyof typeof AQI_SCENARIOS>("good")
  const [selectedDevice, setSelectedDevice] = useState<string>("Esp_353")
  const data = AQI_SCENARIOS[scenario]
  
  // Fetch available devices
  const { devices, loading: devicesLoading, error: devicesError } = useDevices()

  // For sparklines, generate simple arrays around the scenario value
  const co2Data = Array(11).fill(data.co2).map((v, i) => v + (Math.random() - 0.5) * 20)
  const pm25Data = Array(11).fill(data.pm25).map((v, i) => v + (Math.random() - 0.5) * 2)
  const vocData = Array(11).fill(data.voc).map((v, i) => v + (Math.random() - 0.5) * 0.05)
  const coData = Array(11).fill(data.co).map((v, i) => v + (Math.random() - 0.5) * 1)
  const no2Data = Array(11).fill(data.no2).map((v, i) => v + (Math.random() - 0.5) * 5)

  const aqiCardColor = getAQIColor(data.aqi)
  const aqiCardBorderClass =
    aqiCardColor === "green"
      ? "border-safety-green hover:border-safety-green"
      : aqiCardColor === "yellow"
      ? "border-yellow-400 hover:border-yellow-400"
      : "border-danger-coral hover:border-danger-coral"

  const topAnalyticsHoverClass =
    aqiCardColor === "green"
      ? "hover:text-safety-green"
      : aqiCardColor === "yellow"
      ? "hover:text-yellow-600"
      : "hover:text-danger-coral"

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-manrope">AQI Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Link
            href="/analytics"
            className={`flex items-center text-sm font-medium transition-colors ${topAnalyticsHoverClass}`}
          >
            <BarChart2 className="h-4 w-4 mr-1" />
            Analytics
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>

      {/* Demo Toggle */}
      <div className="flex items-center justify-center mb-6">
        <div className="inline-flex rounded-md shadow-sm bg-muted border border-muted-foreground/10">
          {Object.entries(AQI_SCENARIOS).map(([key, val]) => {
            let selectedColor =
              val.color === "green"
                ? "bg-safety-green/20 text-safety-green border border-safety-green focus:ring-safety-green/40"
                : val.color === "yellow"
                ? "bg-yellow-200 text-yellow-600 border border-yellow-400 focus:ring-yellow-300"
                : "bg-danger-coral/20 text-danger-coral border border-danger-coral focus:ring-danger-coral/40"
            return (
              <motion.button
                key={key}
                className={`px-4 py-2 text-sm font-medium font-manrope transition-colors rounded-md focus:outline-none focus:ring-2 ${scenario === key ? selectedColor : "text-muted-foreground hover:bg-muted/60 border border-transparent"}`}
                onClick={() => setScenario(key as keyof typeof AQI_SCENARIOS)}
                type="button"
                layout
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                {val.label}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Weather Info Card */}
      <div className="flex justify-center mb-4">
        <div className="flex items-center gap-4 px-4 py-2 rounded-lg bg-muted/40 border border-muted-foreground/10 text-sm text-muted-foreground shadow-sm min-w-[220px] max-w-xs">
          <Sun className="h-5 w-5 text-yellow-400" />
          <span>{data.temp}°C</span>
          <Droplets className="h-5 w-5 text-blue-400 ml-2" />
          <span>{data.humidity}%</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={scenario}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className={`p-6 hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] ${aqiCardBorderClass}`}>
              <h2 className="text-xl font-semibold font-manrope mb-4">Air Quality Index</h2>
              <AQIVisualization value={data.aqi} previousValue={data.aqi - 6} />
              <div className="mt-4 text-sm font-space-grotesk text-muted-foreground text-center">Updated {data.updated}</div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GasCard
                title="CO₂ Levels"
                value={data.co2}
                unit="ppm"
                status="CO₂ concentration"
                data={co2Data}
                threshold={1000}
                change={parseFloat(((data.co2 - 600) / 600 * 100).toFixed(1))}
              />
              <GasCard
                title="PM2.5 Levels"
                value={data.pm25}
                unit="μg/m³"
                status="PM2.5 concentration"
                data={pm25Data}
                threshold={35}
                change={parseFloat(((data.pm25 - 12) / 12 * 100).toFixed(1))}
              />
              <GasCard
                title="VOC Levels"
                value={data.voc}
                unit="mg/m³"
                status="VOC concentration"
                data={vocData}
                threshold={0.5}
                change={parseFloat(((data.voc - 0.3) / 0.3 * 100).toFixed(1))}
              />
              <GasCard
                title="CO Levels"
                value={data.co}
                unit="ppm"
                status="CO concentration"
                data={coData}
                threshold={9}
                change={parseFloat(((data.co - 5) / 5 * 100).toFixed(1))}
              />
            </div>
          </div>
          <PollutantTrendsCard
            className="mb-8"
            scenarioPollutants={{
              co2: { value: data.co2, threshold: 1000 },
              pm25: { value: data.pm25, threshold: 35 },
              voc: { value: data.voc, threshold: 0.5 },
              co: { value: data.co, threshold: 9 },
              no2: { value: data.no2, threshold: 100 },
              o3: { value: 40, threshold: 70 }, // Ozone static for demo
            }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] border-safety-green/20 hover:border-safety-green">
          <h2 className="text-xl font-semibold font-manrope mb-4">Dashboard Overview</h2>
          <p className="text-muted-foreground mb-6 font-space-grotesk">
            Welcome to the AQI Dashboard. This dashboard provides real-time monitoring of air quality metrics. For
            detailed analysis and methodology, visit the Analytics page.
          </p>

        </Card>

        {/* Live Sensor Data Card */}
        <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] border-blue-500/20 hover:border-blue-500">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold font-manrope mb-2">Live Sensor Data</h2>
              <p className="text-muted-foreground font-space-grotesk">
                Real-time readings from your connected ESP32 devices
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select 
                value={selectedDevice} 
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-background"
              >
                <option value="kitchen_sensor_demo">Smart Kitchen Monitor</option>
                {!devicesLoading && devices.length > 0 && devices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name} ({device.id})
                  </option>
                ))}
              </select>
              <Badge 
                variant="outline" 
                className={`${
                  devices.find(d => d.id === selectedDevice)?.status === 'online' 
                    ? 'border-green-500 text-green-700' 
                    : 'border-red-500 text-red-700'
                }`}
              >
                {selectedDevice}
              </Badge>
            </div>
          </div>
          {devicesLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-muted-foreground">Loading devices...</div>
            </div>
          ) : devicesError ? (
            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div className="text-yellow-800">
                <div className="font-medium mb-1">Device Connection Issue</div>
                <div className="text-sm">Using default device. {devicesError}</div>
              </div>
            </div>
          ) : (
            <RealtimeDataExample deviceId={selectedDevice} refreshInterval={15000} />
          )}
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] border-safety-green/20 hover:border-safety-green">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold font-manrope mb-2">Advanced Analytics</h2>
              <p className="text-muted-foreground font-space-grotesk">
                View detailed analysis and historical trends
              </p>
            </div>
            <Link
              href="/analytics"
              className="inline-flex items-center px-4 py-2 rounded-md bg-safety-green/20 text-foreground hover:bg-safety-green/30 transition-colors"
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              View Analytics
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}