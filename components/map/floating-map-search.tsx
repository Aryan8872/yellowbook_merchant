'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, X, MapPin, Building2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { BranchDetailData } from './branch-detail-drawer'

interface FloatingMapSearchProps {
  branches: BranchDetailData[]
  onSelectBranch: (branch: BranchDetailData) => void
  onClear?: () => void
  placeholder?: string
}

export function FloatingMapSearch({
  branches,
  onSelectBranch,
  onClear,
  placeholder = 'Search branches, address, or cities...',
}: FloatingMapSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Filter recommendations based on query
  const suggestions = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []

    return branches
      .filter((b) => {
        const nameMatch = b.name.toLowerCase().includes(q)
        const addressMatch = b.address?.toLowerCase().includes(q)
        const cityMatch = b.city?.toLowerCase().includes(q)
        const districtMatch = b.district?.toLowerCase().includes(q)
        return nameMatch || addressMatch || cityMatch || districtMatch
      })
      .slice(0, 6)
  }, [branches, query])

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (branch: BranchDetailData) => {
    setQuery(branch.name)
    setIsOpen(false)
    onSelectBranch(branch)
  }

  const handleClear = () => {
    setQuery('')
    setIsOpen(false)
    onClear?.()
  }

  return (
    <div
      ref={containerRef}
      className="absolute top-4 left-4 z-20 w-80 sm:w-96 max-w-[calc(100%-32px)]"
    >
      {/* Search Input Bar */}
      <div className="relative flex items-center bg-background/95 backdrop-blur-md rounded-2xl shadow-xl border overflow-hidden">
        <div className="pl-3.5 pr-2 text-muted-foreground flex items-center">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full h-11 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 text-muted-foreground hover:text-foreground transition"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="mt-1.5 bg-background/95 backdrop-blur-md rounded-2xl border shadow-2xl overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase border-b mb-1">
            Matching Branches ({suggestions.length})
          </div>
          {suggestions.map((branch) => (
            <button
              key={branch.id}
              type="button"
              onClick={() => handleSelect(branch)}
              className="w-full text-left px-3.5 py-2.5 flex items-start gap-3 hover:bg-muted/80 transition"
            >
              <div className="h-7 w-7 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{branch.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {[branch.address, branch.city || branch.district].filter(Boolean).join(', ')}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.trim() && suggestions.length === 0 && (
        <div className="mt-1.5 bg-background/95 backdrop-blur-md rounded-2xl border shadow-xl p-4 text-center text-xs text-muted-foreground animate-in fade-in duration-150">
          No branches found matching "{query}"
        </div>
      )}
    </div>
  )
}
