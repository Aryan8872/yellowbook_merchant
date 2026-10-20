import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FormSelectProps {
  value?: string
  onValueChange?: (value: string | null) => void
  placeholder?: string
  children: React.ReactNode
}

export function FormSelect({ value, onValueChange, placeholder, children }: FormSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  )
}

export { SelectItem }
