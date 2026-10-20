import { Label } from '@/components/ui/label'
import { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  id: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
}

export function FormField({ label, id, error, hint, required, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}
