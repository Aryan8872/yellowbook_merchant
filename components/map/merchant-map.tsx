'use client'

import { MapLoader } from './map-loader'
import { MapLibreConfig } from './maplibre-config'
import * as maplibregl from 'maplibre-gl'
import { toMapLibreLngLat } from '@/lib/utils/coordinate-validation'

interface MerchantMapProps {
  merchants: Array<{
    id: string
    name: string
    lat: number
    lng: number
    status?: string
  }>
  className?: string
}

export function MerchantMap({ merchants, className }: MerchantMapProps) {
  return (
    <div className={className}>
      <MapLibreConfig />
      <MapLoader
        containerId="merchant-map"
        center={[85.324, 27.7172]} // Default to Kathmandu [lng, lat]
        zoom={12}
        onMapLoad={(map: maplibregl.Map) => {
          const bounds = new maplibregl.LngLatBounds()
          let validMarkerCount = 0

          // Add markers for each valid merchant
          merchants.forEach((merchant) => {
            const lngLat = toMapLibreLngLat(merchant.lat, merchant.lng)
            if (!lngLat) {
              console.warn(
                `[MerchantMap] Skipped invalid coordinates for merchant "${merchant.name}" (id: ${merchant.id}): lat=${merchant.lat}, lng=${merchant.lng}`
              )
              return
            }

            const el = document.createElement('div')
            el.className = 'merchant-marker'
            el.style.width = '24px'
            el.style.height = '24px'
            el.style.backgroundColor = merchant.status === 'ACTIVE' ? '#22c55e' : '#ef4444'
            el.style.borderRadius = '50%'
            el.style.border = '2px solid white'
            el.style.cursor = 'pointer'

            new maplibregl.Marker({ element: el })
              .setLngLat(lngLat)
              .setPopup(new maplibregl.Popup().setHTML(`<strong>${merchant.name}</strong>`))
              .addTo(map)

            bounds.extend(lngLat)
            validMarkerCount++
          })

          // Fit bounds to show all valid merchants
          if (validMarkerCount > 0) {
            map.fitBounds(bounds, { padding: 50, maxZoom: 16 })
          }
        }}
      />
    </div>
  )
}
