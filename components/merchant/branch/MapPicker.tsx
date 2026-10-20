'use client'

import * as React from 'react'
import { MapLoader } from '@/components/map/map-loader'
import { MapLibreConfig } from '@/components/map/maplibre-config'
import * as maplibregl from 'maplibre-gl'
import {
  isValidCoordinate,
  toMapLibreLngLat,
  NEPAL_BOUNDS,
  NEPAL_DEFAULT_CENTER,
} from '@/lib/utils/coordinate-validation'
import { createGooglePinElement } from '@/components/map/google-pin-marker'
import { MapPin, Navigation, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MapPickerProps {
  lat?: number
  lng?: number
  onLocationChange: (lat: number, lng: number) => void
}

const PRESET_CITIES: Array<{ name: string; center: [number, number] }> = [
  { name: 'Kathmandu', center: [85.324, 27.7172] },
  { name: 'Pokhara', center: [83.9856, 28.2096] },
  { name: 'Lalitpur', center: [85.3206, 27.671] },
  { name: 'Chitwan', center: [84.4333, 27.6833] },
  { name: 'Birtamod', center: [87.9897, 26.6343] },
  { name: 'Biratnagar', center: [87.2718, 26.4525] },
]

export function MapPicker({ lat, lng, onLocationChange }: MapPickerProps) {
  const mapInstanceRef = React.useRef<maplibregl.Map | null>(null)
  const markerRef = React.useRef<maplibregl.Marker | null>(null)
  const onLocationChangeRef = React.useRef(onLocationChange)
  onLocationChangeRef.current = onLocationChange

  const hasValidCoord = isValidCoordinate(lat, lng)
  const initialCenterRef = React.useRef<[number, number]>(
    hasValidCoord ? [Number(lng), Number(lat)] : NEPAL_DEFAULT_CENTER
  )

  // Update marker position without recreating or re-rendering the Map canvas
  React.useEffect(() => {
    if (!mapInstanceRef.current) return

    if (hasValidCoord) {
      const target: [number, number] = [Number(lng), Number(lat)]
      if (markerRef.current) {
        markerRef.current.setLngLat(target)
      } else {
        const pinEl = createGooglePinElement({
          name: 'Branch Location',
          isActive: true,
        })
        const marker = new maplibregl.Marker({
          element: pinEl,
          draggable: true,
          anchor: 'bottom',
        })
          .setLngLat(target)
          .addTo(mapInstanceRef.current)

        marker.on('dragend', () => {
          const pos = marker.getLngLat()
          onLocationChangeRef.current(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)))
        })

        markerRef.current = marker
      }
    }
  }, [lat, lng, hasValidCoord])

  const onMapLoad = React.useCallback((map: maplibregl.Map) => {
    mapInstanceRef.current = map

    const targetPos = initialCenterRef.current

    // Create draggable pin
    const pinEl = createGooglePinElement({
      name: 'Selected Branch Location',
      isActive: true,
    })

    const marker = new maplibregl.Marker({
      element: pinEl,
      draggable: true,
      anchor: 'bottom',
    })
      .setLngLat(targetPos)
      .addTo(map)

    marker.on('dragend', () => {
      const pos = marker.getLngLat()
      onLocationChangeRef.current(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)))
    })

    markerRef.current = marker

    // Click to set location
    map.on('click', (e) => {
      const newLat = Number(e.lngLat.lat.toFixed(6))
      const newLng = Number(e.lngLat.lng.toFixed(6))
      marker.setLngLat([newLng, newLat])
      onLocationChangeRef.current(newLat, newLng)
    })

    // Add navigation controls (zoom buttons)
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
  }, []) // Empty dependency array ensures map is mounted ONCE and never destroyed during selections!

  const handleFlyToCity = (center: [number, number]) => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo({
        center,
        zoom: 14,
        duration: 1000,
      })
      markerRef.current.setLngLat(center)
      onLocationChangeRef.current(Number(center[1].toFixed(6)), Number(center[0].toFixed(6)))
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1 font-medium text-foreground">
          <MapPin className="h-3.5 w-3.5 text-red-500" />
          Interactive Location Picker
        </span>
        <span>Click map or drag the pin to position</span>
      </div>

      {/* Preset Quick Hub Jump Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pb-1">
        <span className="text-[11px] text-muted-foreground">Quick jump:</span>
        {PRESET_CITIES.map((city) => (
          <Button
            key={city.name}
            type="button"
            variant="outline"
            size="sm"
            className="h-6 px-2 text-[11px] rounded-lg"
            onClick={() => handleFlyToCity(city.center)}
          >
            {city.name}
          </Button>
        ))}
      </div>

      {/* Map Container */}
      <div className="relative h-64 w-full rounded-xl border overflow-hidden bg-muted">
        <MapLibreConfig />
        <MapLoader
          containerId="branch-form-map-picker"
          center={initialCenterRef.current}
          zoom={hasValidCoord ? 14 : 11}
          minZoom={6}
          maxZoom={18}
          maxBounds={NEPAL_BOUNDS}
          onMapLoad={onMapLoad}
          className="h-full w-full"
        />

        {/* Selected Coordinates Overlay Pill */}
        <div className="absolute bottom-2 left-2 z-10 bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-lg border text-[11px] shadow-sm font-mono flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {hasValidCoord
              ? `Lat: ${Number(lat).toFixed(5)}, Lng: ${Number(lng).toFixed(5)}`
              : 'Click map to place pin'}
          </span>
        </div>
      </div>
    </div>
  )
}
