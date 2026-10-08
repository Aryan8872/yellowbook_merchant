"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface GeofenceRadiusInputProps {
  value?: number
  onChange: (value: number) => void
}

const PRESET_RADII = [100, 250, 500, 1000, 2000] // in meters

export function GeofenceRadiusInput({ value = 500, onChange }: GeofenceRadiusInputProps) {
  const [inputValue, setInputValue] = React.useState(String(value))

  React.useEffect(() => {
    setInputValue(String(value))
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value)
    if (num >= 50 && num <= 5000) {
      onChange(num)
    }
    setInputValue(e.target.value)
  }

  const formatRadius = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`
    }
    return `${meters} m`
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Geofence Radius</Label>
        <span className="text-sm text-muted-foreground">{formatRadius(value)}</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {PRESET_RADII.map((radius) => (
            <button
              key={radius}
              type="button"
              onClick={() => onChange(radius)}
              className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                value === radius
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted"
              }`}
            >
              {formatRadius(radius)}
            </button>
          ))}
        </div>

        <Input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          min={50}
          max={5000}
          step={50}
          className="w-full"
          placeholder="500"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Geofence radius is used for fraud detection to verify redemption location.
      </p>
    </div>
  )
}
