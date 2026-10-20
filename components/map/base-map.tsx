'use client'

import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { NEPAL_BOUNDS, NEPAL_DEFAULT_CENTER } from '@/lib/utils/coordinate-validation'

interface BaseMapProps {
  containerId: string
  center?: [number, number]
  zoom?: number
  minZoom?: number
  maxZoom?: number
  maxBounds?: [[number, number], [number, number]]
  style?: string
  onMapLoad?: (map: maplibregl.Map) => void
  className?: string
}

function resolveMapStyle(customStyle?: string): string {
  if (customStyle) {
    return customStyle;
  }

  if (process.env.NEXT_PUBLIC_MAP_STYLE_URL) {
    return process.env.NEXT_PUBLIC_MAP_STYLE_URL;
  }

  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;
  if (apiKey) {
    // Geoapify OSM-Bright Vector Style compatible with MapLibre GL
    return `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${apiKey}`;
  }

  // Fallback demo style
  return 'https://demotiles.maplibre.org/style.json';
}

export function BaseMap({
  containerId,
  center = NEPAL_DEFAULT_CENTER,
  zoom = 12,
  minZoom = 6,
  maxZoom = 18,
  maxBounds = NEPAL_BOUNDS,
  style,
  onMapLoad,
  className = 'w-full h-full',
}: BaseMapProps) {
  const mapRef = useRef<maplibregl.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const onMapLoadRef = useRef(onMapLoad)
  onMapLoadRef.current = onMapLoad

  const resolvedStyle = resolveMapStyle(style)

  useEffect(() => {
    if (!containerRef.current) return
    if (mapRef.current) return // Prevent duplicate mounting

    const map = new maplibregl.Map({
      container: containerId,
      style: resolvedStyle,
      center,
      zoom,
      minZoom,
      maxZoom,
      maxBounds,
      attributionControl: {
        compact: false,
        customAttribution: '<a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a>',
      },
    })

    mapRef.current = map

    map.on('error', (e) => {
      const sanitizedMessage = e.error?.message
        ? e.error.message.replace(/apiKey=[a-zA-Z0-9_-]+/g, 'apiKey=[REDACTED]')
        : 'Unknown map error';
      console.warn('[MapLibre Error]', sanitizedMessage);
    })

    map.on('load', () => {
      if (onMapLoadRef.current) {
        onMapLoadRef.current(map)
      }
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
    // Stable initialization: do not include array objects center/maxBounds or callback refs
    // so parent re-renders (dialogs opening/closing, state changes) never destroy and flicker the WebGL canvas
  }, [containerId, resolvedStyle, zoom, minZoom, maxZoom])

  return (
    <div
      ref={containerRef}
      id={containerId}
      className={className}
      style={{ minHeight: '400px' }}
    />
  )
}
