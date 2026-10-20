'use client'

import { useEffect } from 'react'
import { setWorkerUrl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export function MapLibreConfig() {
  useEffect(() => {
    // Configure MapLibre worker URL for Next.js compatibility
    setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')
  }, [])

  return null
}
