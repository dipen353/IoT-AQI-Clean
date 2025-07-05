"use client"

import Link from "next/link"
import { ChevronRight, BarChart2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import GasCard from "@/components/gas-card"
import AQIVisualization from "@/components/aqi-visualization"
import PollutantTrendsCard from "@/components/pollutant-trends-card"

// Sample data for sparklines
const co2Data = [550, 570, 590, 580, 560, 580, 590, 600, 580, 570, 580]
const pm25Data = [9.8, 10.1, 10.5, 10.2, 9.9, 10.0, 10.3, 10.2, 10.1, 10.2, 10.2]
const vocData = [0.25, 0.28, 0.27, 0.26, 0.29, 0.28, 0.27, 0.26, 0.25, 0.27, 0.28]
const coData = [8, 7, 9, 8, 7, 6, 8, 9, 8, 7, 8]
const no2Data = [45, 48, 50, 49, 47, 46, 48, 50, 49, 48, 47]

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-manrope">AQI Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Link
            href="/analytics"
            className="flex items-center text-sm font-medium hover:text-safety-green transition-colors"
          >
            <BarChart2 className="h-4 w-4 mr-1" />
            Analytics
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] border-safety-green/20 hover:border-safety-green">
          <h2 className="text-xl font-semibold font-manrope mb-4">Air Quality Index</h2>
          <AQIVisualization value={72} previousValue={78} />
          <div className="mt-4 text-sm font-space-grotesk text-muted-foreground text-center">Updated 5 minutes ago</div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GasCard
            title="CO₂ Levels"
            value={580}
            unit="ppm"
            status="Within safe range"
            data={co2Data}
            threshold={600}
            change={2.5}
          />

          <GasCard
            title="PM2.5 Levels"
            value={10.2}
            unit="μg/m³"
            status="Within safe range"
            data={pm25Data}
            threshold={12}
            change={-1.2}
          />

          <GasCard
            title="VOC Levels"
            value={0.28}
            unit="mg/m³"
            status="Within safe range"
            data={vocData}
            threshold={0.3}
            change={3.7}
          />

          <GasCard
            title="CO Levels"
            value={8}
            unit="ppm"
            status="Within safe range"
            data={coData}
            threshold={9}
            change={-2.1}
          />
        </div>
      </div>

      <PollutantTrendsCard className="mb-8" />

      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] border-safety-green/20 hover:border-safety-green">
          <h2 className="text-xl font-semibold font-manrope mb-4">Dashboard Overview</h2>
          <p className="text-muted-foreground mb-6 font-space-grotesk">
            Welcome to the AQI Dashboard. This dashboard provides real-time monitoring of air quality metrics. For
            detailed analysis and methodology, visit the Analytics page.
          </p>
          <Link
            href="/analytics"
            className="inline-flex items-center px-4 py-2 rounded-md bg-safety-green/20 text-foreground hover:bg-safety-green/30 transition-colors"
          >
            <BarChart2 className="h-4 w-4 mr-2" />
            View Analytics
          </Link>
        </Card>
      </div>
    </div>
  )
}

