'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { MapLoader } from './map-loader'
import { MapLibreConfig } from './maplibre-config'
import * as maplibregl from 'maplibre-gl'
import { toMapLibreLngLat, NEPAL_BOUNDS, NEPAL_DEFAULT_CENTER } from '@/lib/utils/coordinate-validation'
import { createGooglePinElement } from './google-pin-marker'
import { BranchDetailDrawer, BranchDetailData } from './branch-detail-drawer'
import { FloatingMapSearch } from './floating-map-search'
import { Maximize2, Minimize2, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BranchMapProps {
  branches: Array<{
    id: string
    name: string
    lat: number
    lng: number
    address?: string
    city?: string
    district?: string
    phone?: string
    isActive?: boolean
    operatingHours?: Record<string, { open: string; close: string; closed?: boolean }>
  }>
  selectedBranchId?: string
  onLocationSelect?: (lat: number, lng: number) => void
  onEditBranch?: (branch: BranchDetailData) => void
  className?: string
}

export function BranchMap({
  branches,
  selectedBranchId: initialSelectedId,
  onLocationSelect,
  onEditBranch,
  className = 'h-150',
}: BranchMapProps) {
  const [selectedBranch, setSelectedBranch] = useState<BranchDetailData | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const mapInstanceRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map())
  const containerWrapperRef = useRef<HTMLDivElement>(null)

  // Track mousedown coordinates to differentiate click from drag/pan
  const mouseDownPosRef = useRef<{ x: number; y: number } | null>(null)

  // Sync initialSelectedId
  useEffect(() => {
    if (initialSelectedId) {
      const match = branches.find((b) => b.id === initialSelectedId)
      if (match) {
        setSelectedBranch(match as BranchDetailData)
        setIsDrawerOpen(true)
      }
    }
  }, [initialSelectedId, branches])

  // Select branch and fly to coordinates with camera offset so pin is NOT hidden under drawer
  const handleSelectBranch = useCallback((branch: BranchDetailData) => {
    setSelectedBranch(branch)
    setIsDrawerOpen(true)

    const map = mapInstanceRef.current
    if (map) {
      const lngLat = toMapLibreLngLat(branch.lat, branch.lng)
      if (lngLat) {
        // Calculate responsive camera offset:
        // On desktop (>640px), the left drawer is 384px wide (w-96) positioned at left-4.
        // In MapLibre GL JS, camera offset is [x, y] in screen pixels where:
        //   +x shifts the visual target coordinate to the RIGHT of the map center.
        //   -x shifts the visual target coordinate to the LEFT of the map center.
        // Shifting with +200px (or half the drawer width ~192px) positions the marker
        // right in the center of the remaining unobstructed right-hand viewport.
        // On mobile, the drawer opens from top/bottom, so +140y pushes the marker down into clear view.
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
        const cameraOffset: [number, number] = isMobile ? [0, 140] : [200, 0]

        map.stop()
        map.flyTo({
          center: lngLat,
          offset: cameraOffset,
          zoom: 15,
          duration: 1100,
          essential: true,
        })
      }
    }
  }, [])

  // Deselect branch
  const handleDeselect = useCallback(() => {
    setIsDrawerOpen(false)
    setSelectedBranch(null)
  }, [])

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerWrapperRef.current) return

    if (!document.fullscreenElement) {
      containerWrapperRef.current.requestFullscreen().catch(() => {
        setIsFullscreen(!isFullscreen)
      })
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {
        setIsFullscreen(false)
      })
      setIsFullscreen(false)
    }
  }

  // Handle ESC or native fullscreen change
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
      if (mapInstanceRef.current) {
        setTimeout(() => mapInstanceRef.current?.resize(), 200)
      }
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  // Update marker styles without touching root MapLibre container transform!
  useEffect(() => {
    markersRef.current.forEach((marker, branchId) => {
      const container = marker.getElement()
      const inner = container.querySelector('.pin-inner-wrapper') as HTMLElement
      const bodyPath = container.querySelector('.pin-body')
      const dotCircle = container.querySelector('.pin-dot')
      const labelPill = container.querySelector('.pin-label-pill') as HTMLElement
      const isActive = selectedBranch?.id === branchId

      if (isActive) {
        container.classList.add('active-pin')
        container.style.zIndex = '50'
        if (inner) {
          inner.style.transform = 'scale(1.25)'
        }
        if (bodyPath) bodyPath.setAttribute('fill', '#EA4335')
        if (dotCircle) dotCircle.setAttribute('fill', '#EA4335')
        if (labelPill) {
          labelPill.className =
            'pin-label-pill mt-0.5 px-2 py-0.5 max-w-[96px] truncate text-[11px] font-semibold tracking-tight text-center rounded-md border shadow-md transition-all bg-red-600 text-white border-red-700 shadow-red-500/20'
        }
      } else {
        container.classList.remove('active-pin')
        container.style.zIndex = '10'
        if (inner) {
          inner.style.transform = 'scale(1)'
        }
        if (bodyPath) bodyPath.setAttribute('fill', '#D93025')
        if (dotCircle) dotCircle.setAttribute('fill', '#D93025')
        if (labelPill) {
          labelPill.className =
            'pin-label-pill mt-0.5 px-2 py-0.5 max-w-[96px] truncate text-[11px] font-semibold tracking-tight text-center rounded-md border shadow-md transition-all bg-background/95 backdrop-blur-md text-foreground border-border/80 hover:bg-background'
        }
      }
    })
  }, [selectedBranch])

  const onMapLoad = useCallback(
    (map: maplibregl.Map) => {
      mapInstanceRef.current = map

      // Clear existing markers
      markersRef.current.forEach((m) => m.remove())
      markersRef.current.clear()

      const bounds = new maplibregl.LngLatBounds()
      let validMarkerCount = 0

      // Add Google Maps markers for each branch
      branches.forEach((branch) => {
        const lngLat = toMapLibreLngLat(branch.lat, branch.lng)
        if (!lngLat) return

        const numLat = typeof branch.lat === 'number' ? branch.lat : Number(branch.lat)
        const numLng = typeof branch.lng === 'number' ? branch.lng : Number(branch.lng)

        const branchData: BranchDetailData = {
          id: branch.id,
          name: branch.name,
          address: branch.address || 'Address not provided',
          city: branch.city,
          district: branch.district,
          phone: branch.phone || '',
          lat: numLat,
          lng: numLng,
          isActive: branch.isActive,
          operatingHours: branch.operatingHours,
        }

        const markerEl = createGooglePinElement({
          name: branch.name,
          isActive: selectedBranch?.id === branch.id,
          onClick: () => handleSelectBranch(branchData),
        })

        const marker = new maplibregl.Marker({
          element: markerEl,
          anchor: 'bottom',
        })
          .setLngLat(lngLat)
          .addTo(map)

        markersRef.current.set(branch.id, marker)
        bounds.extend(lngLat)
        validMarkerCount++
      })

      // Capture mousedown on map canvas to distinguish click from drag
      const canvas = map.getCanvas()
      canvas.addEventListener('mousedown', (e) => {
        mouseDownPosRef.current = { x: e.clientX, y: e.clientY }
      })

      // Map click handler (fires only if pointer moved less than 6px — i.e. not a drag/pan)
      map.on('click', (e) => {
        const startPos = mouseDownPosRef.current
        if (startPos) {
          const dist = Math.hypot(e.point.x - startPos.x, e.point.y - startPos.y)
          // If dragged more than 6 pixels, don't dismiss!
          if (dist > 6) {
            return
          }
        }

        // Close drawer when clicking blank map
        handleDeselect()

        if (onLocationSelect) {
          onLocationSelect(e.lngLat.lat, e.lngLat.lng)
        }
      })

      // Fit bounds to branches if available, else stay centered on Kathmandu
      if (validMarkerCount > 0) {
        map.fitBounds(bounds, {
          padding: { top: 70, bottom: 50, left: 100, right: 50 },
          maxZoom: 16,
        })
      }
    },
    // Stable dependencies: selectedBranch is tracked via useEffect without re-running onMapLoad
    [branches, handleSelectBranch, handleDeselect, onLocationSelect]
  )

  const normalizedBranches: BranchDetailData[] = branches.map((b) => ({
    id: b.id,
    name: b.name,
    address: b.address || '',
    city: b.city,
    district: b.district,
    phone: b.phone || '',
    lat: typeof b.lat === 'number' ? b.lat : Number(b.lat) || 0,
    lng: typeof b.lng === 'number' ? b.lng : Number(b.lng) || 0,
    isActive: b.isActive,
    operatingHours: b.operatingHours,
  }))

  return (
    <div
      ref={containerWrapperRef}
      className={`relative rounded-xl overflow-hidden border bg-card ${className} ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : ''
      }`}
    >
      <MapLibreConfig />

      {/* Floating Google Maps Search Bar (hidden when drawer is open on small screens) */}
      {!isDrawerOpen && (
        <FloatingMapSearch
          branches={normalizedBranches}
          onSelectBranch={handleSelectBranch}
          onClear={handleDeselect}
        />
      )}

      {/* Google Maps Style Left Detail Drawer */}
      <BranchDetailDrawer
        branch={selectedBranch}
        open={isDrawerOpen}
        onClose={handleDeselect}
        onEdit={onEditBranch}
      />

      {/* Floating Controls: Fullscreen & Center Reset */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <Button
          size="icon"
          variant="secondary"
          onClick={toggleFullscreen}
          className="h-9 w-9 rounded-xl bg-background/90 backdrop-blur-md shadow-lg border hover:bg-background"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>

        <Button
          size="icon"
          variant="secondary"
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo({
                center: NEPAL_DEFAULT_CENTER,
                zoom: 12,
                duration: 1000,
              })
            }
          }}
          className="h-9 w-9 rounded-xl bg-background/90 backdrop-blur-md shadow-lg border hover:bg-background"
          title="Reset to Kathmandu"
        >
          <Navigation className="h-4 w-4 text-primary" />
        </Button>
      </div>

      {/* Map Canvas */}
      <MapLoader
        containerId="branch-map"
        center={NEPAL_DEFAULT_CENTER}
        zoom={12}
        minZoom={6}
        maxZoom={18}
        maxBounds={NEPAL_BOUNDS}
        onMapLoad={onMapLoad}
      />
    </div>
  )
}
