'use client'

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

const BaseMap = dynamic(() => import('./base-map').then(mod => ({ default: mod.BaseMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-100 flex items-center justify-center bg-muted">
      <div className="text-muted-foreground">Loading map...</div>
    </div>
  ),
})

export function MapLoader(props: any) {
  return <BaseMap {...props} />
}
