'use client'

import React from 'react'
import {
  X,
  MapPin,
  Phone,
  Navigation,
  Clock,
  ExternalLink,
  Pencil,
  Building2,
  CheckCircle2,
  Share2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export interface BranchDetailData {
  id: string
  name: string
  address: string
  city?: string
  district?: string
  phone: string
  lat: number
  lng: number
  isActive?: boolean
  operatingHours?: Record<string, { open: string; close: string; closed?: boolean }>
}

interface BranchDetailDrawerProps {
  branch: BranchDetailData | null
  open: boolean
  onClose: () => void
  onEdit?: (branch: BranchDetailData) => void
}

export function BranchDetailDrawer({
  branch,
  open,
  onClose,
  onEdit,
}: BranchDetailDrawerProps) {
  if (!branch) return null

  const numLat = typeof branch.lat === 'number' ? branch.lat : Number(branch.lat) || 0
  const numLng = typeof branch.lng === 'number' ? branch.lng : Number(branch.lng) || 0

  // Format today's operating hours
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const todayHours = branch.operatingHours?.[today]
  const hoursText = todayHours
    ? todayHours.closed
      ? 'Closed today'
      : `Open: ${todayHours.open} - ${todayHours.close}`
    : 'Hours not specified'

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${numLat},${numLng}`

  return (
    <div
      className={`absolute top-4 left-4 bottom-4 w-96 max-w-[calc(100%-32px)] z-30 transition-transform duration-300 ease-out pointer-events-auto ${
        open ? 'translate-x-0' : '-translate-x-[115%]'
      }`}
    >
      <div className="h-full bg-background/95 backdrop-blur-md rounded-2xl border shadow-2xl flex flex-col overflow-hidden">
        {/* Header Hero Image / Pattern */}
        <div className="relative h-44 bg-gradient-to-br from-red-500 via-rose-600 to-amber-600 p-4 flex flex-col justify-between text-white">
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
            >
              {branch.district || 'Nepal'}
            </Badge>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 text-white"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-white/80 font-medium">
              <Building2 className="h-3.5 w-3.5" />
              <span>Official Merchant Branch</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white line-clamp-1">
              {branch.name}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
          {/* Quick Actions Row matching Google Maps */}
          <div className="grid grid-cols-3 gap-2 pb-2 border-b">
            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-muted transition text-center group"
            >
              <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center mb-1 group-hover:scale-110 transition">
                <Navigation className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-foreground">Directions</span>
            </a>

            {branch.phone ? (
              <a
                href={`tel:${branch.phone}`}
                className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-muted transition text-center group"
              >
                <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center mb-1 group-hover:scale-110 transition">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-foreground">Call</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center p-2 rounded-xl opacity-40 text-center">
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center mb-1">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="text-xs">No Phone</span>
              </div>
            )}

            {onEdit ? (
              <button
                type="button"
                onClick={() => onEdit(branch)}
                className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-muted transition text-center group"
              >
                <div className="h-9 w-9 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center mb-1 group-hover:scale-110 transition">
                  <Pencil className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-foreground">Edit</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${branch.name}: ${branch.address}, ${branch.city || ''} (Coordinates: ${branch.lat}, ${branch.lng})`
                  )
                }}
                className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-muted transition text-center group"
              >
                <div className="h-9 w-9 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center mb-1 group-hover:scale-110 transition">
                  <Share2 className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-foreground">Share</span>
              </button>
            )}
          </div>

          {/* Details List */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-foreground leading-snug">{branch.address}</p>
                <p className="text-xs text-muted-foreground">
                  {[branch.city, branch.district].filter(Boolean).join(', ') || 'Nepal'}
                </p>
                <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                  Lat: {numLat.toFixed(5)}, Lng: {numLng.toFixed(5)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium text-foreground">{hoursText}</p>
                <p className="text-xs text-muted-foreground">Operating Schedule</p>
              </div>
            </div>

            {branch.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium text-foreground">{branch.phone}</p>
                  <p className="text-xs text-muted-foreground">Direct Contact</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <div className="flex items-center gap-2">
                <Badge variant={branch.isActive !== false ? 'default' : 'secondary'} className="text-xs">
                  {branch.isActive !== false ? 'Active Branch' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
          <span>OfferNepal Map Discovery</span>
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:underline font-medium"
          >
            <span>Open in Maps</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  )
}
