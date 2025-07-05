"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { useTheme } from "next-themes"

const gasData = [
  { name: "CO₂", value: 30, color: "#90EE90" },
  { name: "PM2.5", value: 25, color: "#7FE57F" },
  { name: "VOC", value: 20, color: "#6FDC6F" },
  { name: "CO", value: 15, color: "#5FD35F" },
  { name: "NO₂", value: 10, color: "#4FCA4F" },
]

const darkModeGasData = [
  { name: "CO₂", value: 30, color: "#14532D" },
  { name: "PM2.5", value: 25, color: "#155e35" },
  { name: "VOC", value: 20, color: "#166938" },
  { name: "CO", value: 15, color: "#1a7340" },
  { name: "NO₂", value: 10, color: "#1e7d45" },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-3 border border-border rounded-md shadow-md">
        <p className="font-manrope font-semibold">{`${payload[0].name}: ${payload[0].value}%`}</p>
        <p className="text-sm text-muted-foreground font-space-grotesk">
          {payload[0].name === "CO₂" && "Carbon dioxide - impacts cognitive function"}
          {payload[0].name === "PM2.5" && "Fine particulate matter - respiratory impact"}
          {payload[0].name === "VOC" && "Volatile organic compounds - chemical pollutants"}
          {payload[0].name === "CO" && "Carbon monoxide - toxic gas"}
          {payload[0].name === "NO₂" && "Nitrogen dioxide - respiratory irritant"}
        </p>
      </div>
    )
  }

  return null
}

export default function GasContributionChart() {
  const { theme } = useTheme()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(null)
  }

  if (!mounted) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <div className="animate-pulse h-64 w-64 rounded-full bg-muted"></div>
      </div>
    )
  }

  const data = theme === "dark" ? darkModeGasData : gasData

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={activeIndex !== null ? 150 : 140}
          paddingAngle={2}
          dataKey="value"
          onMouseEnter={onPieEnter}
          onMouseLeave={onPieLeave}
          animationDuration={500}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color} 
              stroke={activeIndex === index ? (theme === "dark" ? "#ffffff" : "#000000") : "transparent"}
              strokeWidth={2}
              style={{
                filter: activeIndex === index ? `drop-shadow(0px 0px 6px ${theme === "dark" ? "rgba(20, 83, 45, 0.5)" : "rgba(144, 238, 144, 0.5)"})` : "none",
                transition: "all 0.3s ease"
              }}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          layout="vertical" 
          verticalAlign="middle" 
          align="right"
          formatter={(value, entry: any, index) => (
            <span className={`font-space-grotesk ${activeIndex === index ? "font-bold" : ""}`}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

