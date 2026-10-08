"use client"

import * as React from "react"

interface MapPickerProps {
  lat?: number
  lng?: number
  onLocationChange: (lat: number, lng: number) => void
}

const DEFAULT_CENTER = { lng: 85.3240, lat: 27.7172 } // Kathmandu

export function MapPicker({ lat, lng, onLocationChange }: MapPickerProps) {
  // Map integration temporarily disabled due to Turbopack resolution issues
  // Will be re-enabled with MapLibre once build system is stable
  return (
    <div className="h-64 w-full rounded-md border bg-muted/40 flex items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Map picker temporarily disabled
        </p>
        <p className="text-xs text-muted-foreground">
          Please enter coordinates manually below
        </p>
        <p className="text-xs text-muted-foreground">
          Default: Kathmandu ({DEFAULT_CENTER.lat}, {DEFAULT_CENTER.lng})
        </p>
      </div>
    </div>
  )
}
