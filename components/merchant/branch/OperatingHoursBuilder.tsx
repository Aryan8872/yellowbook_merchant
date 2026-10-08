"use client"

import * as React from "react"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const

type DayOfWeek = (typeof DAYS)[number]

interface DaySchedule {
  open: string
  close: string
  closed?: boolean
}

interface OperatingHoursBuilderProps {
  value?: Record<string, DaySchedule>
  onChange: (value: Record<string, DaySchedule>) => void
}

export function OperatingHoursBuilder({ value = {}, onChange }: OperatingHoursBuilderProps) {
  const [copySourceDay, setCopySourceDay] = React.useState<DayOfWeek | null>(null)

  const handleDayChange = (day: DayOfWeek, field: keyof DaySchedule, newValue: string | boolean) => {
    const currentSchedule = value[day] || { open: "09:00", close: "22:00", closed: false }
    onChange({
      ...value,
      [day]: {
        ...currentSchedule,
        [field]: newValue,
      },
    })
  }

  const handleCopyToAll = (sourceDay: DayOfWeek) => {
    const sourceSchedule = value[sourceDay]
    if (!sourceSchedule) return

    const newSchedule: Record<string, DaySchedule> = {}
    DAYS.forEach((day) => {
      newSchedule[day] = { ...sourceSchedule }
    })
    onChange(newSchedule)
    setCopySourceDay(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Operating Hours</Label>
        {copySourceDay && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleCopyToAll(copySourceDay)}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy {copySourceDay} to all
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {DAYS.map((day) => {
          const schedule = value[day] || { open: "09:00", close: "22:00", closed: false }
          return (
            <div key={day} className="flex items-center gap-3 rounded-md border p-3">
              <div className="flex-1">
                <Label htmlFor={`${day}-closed`} className="capitalize">
                  {day}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`${day}-closed`}
                  checked={schedule.closed}
                  onCheckedChange={(checked) =>
                    handleDayChange(day, "closed", checked as boolean)
                  }
                />
                <Label htmlFor={`${day}-closed`} className="text-sm">
                  Closed
                </Label>
              </div>
              {!schedule.closed && (
                <>
                  <Input
                    type="time"
                    value={schedule.open}
                    onChange={(e) => handleDayChange(day, "open", e.target.value)}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={schedule.close}
                    onChange={(e) => handleDayChange(day, "close", e.target.value)}
                    className="w-24"
                  />
                </>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCopySourceDay(day)}
                title="Copy to all days"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
