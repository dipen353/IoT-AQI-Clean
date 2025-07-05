import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// AQI color utility
export function getAQIColor(aqi: number): 'green' | 'yellow' | 'red' {
  if (aqi <= 50) return 'green';
  if (aqi <= 100) return 'yellow';
  return 'red';
}

// Optionally, for pollutant levels (assuming similar breakpoints)
export function getPollutantColor(level: number, low: number, moderate: number): 'green' | 'yellow' | 'red' {
  if (level <= low) return 'green';
  if (level <= moderate) return 'yellow';
  return 'red';
}
