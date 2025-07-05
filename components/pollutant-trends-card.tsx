// components/pollutant-trends-card.tsx
"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts"
import { TrendingDown, TrendingUp, Info } from "lucide-react"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getPollutantColor } from "@/lib/utils"

const pollutants = [
  {
    id: "co2",
    name: "CO₂",
    unit: "ppm",
    threshold: 1000,
    description: "Carbon dioxide levels above 1000 ppm can cause drowsiness and impair cognitive function.",
    color: "#6366F1",
  },
  {
    id: "pm25",
    name: "PM2.5",
    unit: "μg/m³",
    threshold: 35,
    description: "Fine particulate matter can penetrate deep into the lungs and cause respiratory issues.",
    color: "#3B82F6",
  },
  {
    id: "voc",
    name: "VOCs",
    unit: "mg/m³",
    threshold: 0.5,
    description: "Volatile organic compounds can cause eye, nose, and throat irritation.",
    color: "#10B981",
  },
  {
    id: "co",
    name: "CO",
    unit: "ppm",
    threshold: 9,
    description: "Carbon monoxide is a toxic gas that can cause headaches and dizziness.",
    color: "#F59E0B",
  },
  {
    id: "no2",
    name: "NO₂",
    unit: "ppb",
    threshold: 100,
    description: "Nitrogen dioxide can worsen respiratory conditions like asthma.",
    color: "#EF4444",
  },
  {
    id: "o3",
    name: "Ozone",
    unit: "ppb",
    threshold: 70,
    description: "Ground-level ozone can trigger a variety of health problems including chest pain and coughing.",
    color: "#8B5CF6",
  },
]

const generateTrendData = (baseValue: number, variance: number, threshold: number, days = 7) => {
  const result = []
  const today = new Date()
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dayName = dayNames[date.getDay()]
    const randomVariance = (Math.random() * 2 - 1) * variance
    const value = Math.max(0, baseValue + randomVariance)

    result.push({
      day: dayName,
      value: Number.parseFloat(value.toFixed(1)),
      threshold,
    })
  }

  return result
}

const pollutantData = {
  co2: generateTrendData(580, 100, 1000),
  pm25: generateTrendData(18, 8, 35),
  voc: generateTrendData(0.28, 0.1, 0.5),
  co: generateTrendData(5, 2, 9),
  no2: generateTrendData(47, 15, 100),
  o3: generateTrendData(40, 12, 70),
}

interface PollutantTrendsCardProps {
  className?: string
  scenarioPollutants?: {
    [key: string]: { value: number; threshold: number }
  }
}

export default function PollutantTrendsCard({ className, scenarioPollutants }: PollutantTrendsCardProps) {
  const [activeTab, setActiveTab] = useState("co2")
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Card className={`p-6 hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] border-safety-green/20 hover:border-safety-green ${className || ""}`}>
        <CardHeader>
          <CardTitle>Pollutant Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] animate-pulse bg-muted rounded-lg"></div>
        </CardContent>
      </Card>
    )
  }

  const activePollutant = pollutants.find((p) => p.id === activeTab) || pollutants[0]
  // Use scenario values if provided, else fallback to default
  const scenario = scenarioPollutants?.[activeTab]
  const trendData = scenario
    ? (() => {
        // Generate 6 random values, last value is scenario.value
        const arr = Array(6)
          .fill(0)
          .map(() => {
            const variance = activePollutant.threshold * 0.1
            return Math.max(0, scenario.value + (Math.random() - 0.5) * variance)
          })
        arr.push(scenario.value)
        return arr.map((v, i) => ({
          day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i % 7],
          value: Number.parseFloat(v.toFixed(1)),
          threshold: scenario.threshold,
        }))
      })()
    : pollutantData[activeTab as keyof typeof pollutantData]
  const currentValue = trendData[trendData.length - 1].value
  const previousValue = trendData[trendData.length - 2].value
  const change = currentValue - previousValue
  const changePercentage = Math.round((change / previousValue) * 100 * 10) / 10
  const isSafe = currentValue <= (scenario ? scenario.threshold : activePollutant.threshold)
  const color = getPollutantColor(currentValue, (scenario ? scenario.threshold : activePollutant.threshold) * 0.7, (scenario ? scenario.threshold : activePollutant.threshold))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload
      const isSafe = dataPoint.value <= dataPoint.threshold
      return (
        <div className="bg-background p-3 border border-border rounded-md shadow-md">
          <p className="font-manrope font-semibold">{label}</p>
          <p className={`text-sm font-space-grotesk ${color === "green" ? "text-safety-green" : color === "yellow" ? "text-yellow-600" : "text-danger-coral"}`}>
            {activePollutant.name}: {dataPoint.value} {activePollutant.unit}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Threshold: {dataPoint.threshold} {activePollutant.unit}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className={`p-6 hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] ${color === "green" ? "border-safety-green hover:border-safety-green" : color === "yellow" ? "border-yellow-400 hover:border-yellow-400" : "border-danger-coral hover:border-danger-coral"} ${className || ""}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Pollutant Trends</span>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  This chart shows the trend of various pollutants over the past week. Click on a pollutant tab to view
                  its specific trend.
                </p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="co2" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-6 grid grid-cols-3 md:grid-cols-6">
            {pollutants.map((pollutant) => (
              <TabsTrigger key={pollutant.id} value={pollutant.id} className="text-sm">
                {pollutant.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {pollutants.map((pollutant) => (
            <TabsContent key={pollutant.id} value={pollutant.id} className="mt-0">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold font-manrope">{pollutant.name}</h3>
                      <div className={`text-sm font-space-grotesk ${color === "green" ? "text-safety-green" : color === "yellow" ? "text-yellow-600" : "text-danger-coral"}`}>
                        {color === "green" ? "✓ Safe" : color === "yellow" ? "● Moderate" : "⚠ Unsafe"}
                      </div>
                    </div>
                    <div className="flex items-baseline mt-2">
                      <div className={`text-4xl font-bold font-manrope ${color === "green" ? "text-safety-green" : color === "yellow" ? "text-yellow-600" : "text-danger-coral"}`}>
                        {currentValue}
                      </div>
                      <div className="text-sm font-space-grotesk text-muted-foreground ml-2">{pollutant.unit}</div>
                      {change !== 0 && (
                        <div className={`flex items-center text-sm ml-4 ${change > 0 ? "text-danger-coral" : "text-safety-green"}`}>
                          {change > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                          {Math.abs(changePercentage)}%
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">{pollutant.description}</div>
                  <div className="mb-2 relative h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${color === "green" ? "bg-safety-green" : color === "yellow" ? "bg-yellow-200" : "bg-danger-coral"}`}
                      style={{
                        width: `${Math.min((currentValue / (scenario ? scenario.threshold : activePollutant.threshold)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0 {pollutant.unit}</span>
                    <span>Threshold: {(scenario ? scenario.threshold : activePollutant.threshold)} {pollutant.unit}</span>
                  </div>
                </div>
                <div className="md:w-2/3 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickMargin={10} />
                      <YAxis domain={[0, "auto"]} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickMargin={10} width={40} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine
                        y={scenario ? scenario.threshold : activePollutant.threshold}
                        stroke={theme === "dark" ? "hsl(0, 70%, 40%)" : "hsl(0, 100%, 70%)"}
                        strokeDasharray="3 3"
                        label={{
                          value: "Threshold",
                          position: "insideTopRight",
                          fill: theme === "dark" ? "hsl(0, 70%, 40%)" : "hsl(0, 100%, 70%)",
                          fontSize: 12,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={pollutant.color}
                        strokeWidth={2}
                        dot={{ r: 4, fill: pollutant.color, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: pollutant.color, strokeWidth: 0 }}
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
