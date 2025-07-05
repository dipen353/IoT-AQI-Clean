"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { ArrowUp, ArrowDown } from "lucide-react"

interface AQIVisualizationProps {
  value: number
  previousValue?: number
  maxValue?: number
  animated?: boolean
}

export default function AQIVisualization({
  value,
  previousValue = value - 5,
  maxValue = 500,
  animated = true,
}: AQIVisualizationProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [currentValue, setCurrentValue] = useState(0)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Animation effect
  useEffect(() => {
    if (animated && mounted) {
      const timer = setTimeout(() => {
        setCurrentValue(value)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setCurrentValue(value)
    }
  }, [value, animated, mounted])

  if (!mounted) {
    return <div className="h-[200px] w-full animate-pulse bg-muted rounded-lg" />
  }

  // Determine AQI category and color
  const getCategory = () => {
    if (currentValue <= 50) return "Good"
    if (currentValue <= 100) return "Moderate"
    if (currentValue <= 150) return "Unhealthy for Sensitive Groups"
    if (currentValue <= 200) return "Unhealthy"
    if (currentValue <= 300) return "Very Unhealthy"
    return "Hazardous"
  }

  const getColor = () => {
    if (currentValue <= 50) return theme === "dark" ? "#14532D" : "#90EE90" // Good - Green
    if (currentValue <= 100) return "#FFDE33" // Moderate - Yellow
    if (currentValue <= 150) return "#FF9933" // Unhealthy for Sensitive Groups - Orange
    if (currentValue <= 200) return "#FF3333" // Unhealthy - Red
    if (currentValue <= 300) return "#990099" // Very Unhealthy - Purple
    return "#660000" // Hazardous - Maroon
  }

  const getTextColor = () => {
    if (currentValue <= 50) return "text-safety-green"
    if (currentValue <= 100) return "text-yellow-400"
    if (currentValue <= 150) return "text-orange-400"
    if (currentValue <= 200) return "text-red-500"
    if (currentValue <= 300) return "text-purple-500"
    return "text-red-900"
  }

  const getBackgroundColor = () => {
    if (currentValue <= 50) return "bg-safety-green/10"
    if (currentValue <= 100) return "bg-yellow-400/10"
    if (currentValue <= 150) return "bg-orange-400/10"
    if (currentValue <= 200) return "bg-red-500/10"
    if (currentValue <= 300) return "bg-purple-500/10"
    return "bg-red-900/10"
  }

  const getBorderColor = () => {
    if (currentValue <= 50) return "border-safety-green"
    if (currentValue <= 100) return "border-yellow-400"
    if (currentValue <= 150) return "border-orange-400"
    if (currentValue <= 200) return "border-red-500"
    if (currentValue <= 300) return "border-purple-500"
    return "border-red-900"
  }

  // Calculate percentage for the progress bar
  const percentage = Math.min((currentValue / maxValue) * 100, 100)

  // Calculate change from previous value
  const change = currentValue - previousValue
  const changePercentage = previousValue ? Math.round((change / previousValue) * 100) : 0

  return (
    <div className="w-full">
      <div className="flex flex-col items-center mb-4">
        <motion.div
          className={`text-7xl font-bold font-manrope ${getTextColor()}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {currentValue}
        </motion.div>
        <div className="text-xl font-semibold font-manrope mt-2">{getCategory()}</div>

        <div className="flex items-center mt-2">
          {change !== 0 && (
            <div className={`flex items-center text-sm ${change > 0 ? "text-danger-coral" : "text-safety-green"}`}>
              {change > 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
              {Math.abs(change)} ({Math.abs(changePercentage)}%)
            </div>
          )}
        </div>
      </div>

      <div className="relative h-8 w-full bg-muted rounded-full overflow-hidden mb-4">
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{ backgroundColor: getColor() }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1 }}
        />

        {/* AQI category markers */}
        {[50, 100, 150, 200, 300].map((marker) => {
          const markerPosition = (marker / maxValue) * 100
          return (
            <div
              key={marker}
              className="absolute top-0 h-full w-px bg-background"
              style={{ left: `${markerPosition}%` }}
            >
              <div className="absolute -top-6 -translate-x-1/2 text-xs font-medium">{marker}</div>
            </div>
          )
        })}
      </div>

      <div className={`p-4 rounded-lg ${getBackgroundColor()} border ${getBorderColor()} mt-4`}>
        <h3 className="font-semibold mb-2">Health Implications</h3>
        <p className="text-sm">
          {currentValue <= 50 && "Air quality is considered satisfactory, and air pollution poses little or no risk."}
          {currentValue > 50 &&
            currentValue <= 100 &&
            "Air quality is acceptable; however, there may be a moderate health concern for a very small number of people."}
          {currentValue > 100 &&
            currentValue <= 150 &&
            "Members of sensitive groups may experience health effects. The general public is not likely to be affected."}
          {currentValue > 150 &&
            currentValue <= 200 &&
            "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects."}
          {currentValue > 200 &&
            currentValue <= 300 &&
            "Health warnings of emergency conditions. The entire population is more likely to be affected."}
          {currentValue > 300 && "Health alert: everyone may experience more serious health effects."}
        </p>
      </div>
    </div>
  )
}

