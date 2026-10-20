'use client'

import React from 'react'

interface GooglePinMarkerProps {
  name: string
  isActive?: boolean
  onClick?: () => void
  size?: number
}

/**
 * Truncate long branch names for the map pill label
 */
function getShortBranchName(fullName: string): string {
  if (!fullName) return ''
  const trimmed = fullName.trim()
  if (trimmed.length <= 15) return trimmed
  return trimmed.slice(0, 14) + '…'
}

/**
 * High-definition Google Maps Pin Marker with compact branch name label below.
 * CRITICAL MAPLIBRE FIX:
 * The outer container element must NEVER have CSS transform or transition-transform applied to it.
 * Scaling on hover and active selection occurs strictly on the inner wrapper with transform-origin: 50% 100%.
 */
export function createGooglePinElement({
  name,
  isActive = false,
  onClick,
}: GooglePinMarkerProps): HTMLElement {
  const container = document.createElement('div')
  container.className = 'google-maps-pin-anchor cursor-pointer select-none flex flex-col items-center'
  container.style.width = '100px'
  container.style.height = '62px'
  container.style.pointerEvents = 'auto'

  const pinColor = isActive ? '#EA4335' : '#D93025'
  const strokeColor = isActive ? '#B31412' : '#FFFFFF'
  const shortName = getShortBranchName(name)

  container.innerHTML = `
    <!-- Teardrop Pin Wrapper -->
    <div class="pin-inner-wrapper group" style="width: 32px; height: 42px; transform-origin: 50% 100%; transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); filter: drop-shadow(0 2px 5px rgba(0,0,0,0.4)); transform: ${
      isActive ? 'scale(1.25)' : 'scale(1)'
    };">
      <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Pin Body -->
        <path class="pin-body" d="M16 0C7.16344 0 0 7.16344 0 16C0 26.6667 14.5455 40.7273 15.1727 41.3347C15.6322 41.7801 16.3678 41.7801 16.8273 41.3347C17.4545 40.7273 32 26.6667 32 16C32 7.16344 24.8366 0 16 0Z" 
              fill="${pinColor}" 
              stroke="${strokeColor}" 
              stroke-width="1.5"/>
        <!-- Inner White Circle -->
        <circle cx="16" cy="15" r="6" fill="#FFFFFF"/>
        <!-- Center Accent Dot -->
        <circle class="pin-dot" cx="16" cy="15" r="2.5" fill="${pinColor}"/>
      </svg>
    </div>

    <!-- Branch Name Pill Below Pointer -->
    <div class="pin-label-pill mt-0.5 px-2 py-0.5 max-w-[96px] truncate text-[11px] font-semibold tracking-tight text-center rounded-md border shadow-md transition-all ${
      isActive
        ? 'bg-red-600 text-white border-red-700 shadow-red-500/20'
        : 'bg-background/95 backdrop-blur-md text-foreground border-border/80 hover:bg-background'
    }">
      ${shortName}
    </div>
  `

  const innerWrapper = container.querySelector('.pin-inner-wrapper') as HTMLElement
  const labelPill = container.querySelector('.pin-label-pill') as HTMLElement

  // Hover effect applied exclusively to inner wrapper and label
  container.addEventListener('mouseenter', () => {
    if (innerWrapper && !container.classList.contains('active-pin')) {
      innerWrapper.style.transform = 'scale(1.12)'
      if (labelPill) labelPill.style.transform = 'scale(1.05)'
    }
  })

  container.addEventListener('mouseleave', () => {
    if (innerWrapper && !container.classList.contains('active-pin')) {
      innerWrapper.style.transform = 'scale(1)'
      if (labelPill) labelPill.style.transform = 'scale(1)'
    }
  })

  if (isActive) {
    container.classList.add('active-pin')
  }

  if (onClick) {
    container.addEventListener('click', (e) => {
      e.stopPropagation()
      onClick()
    })
  }

  return container
}
