'use client'

import * as React from 'react'
import { Plus, Pencil, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Branch, CreateBranchDto, UpdateBranchDto } from '@/lib/types/branch'
import { useBranch } from '@/lib/merchant/branch-context'
import { useAuthStore } from '@/lib/auth/auth-store'
import { OperatingHoursBuilder } from './OperatingHoursBuilder'
import { MapPicker } from './MapPicker'

const DISTRICTS = ['JHAPA', 'KATHMANDU', 'CHITWAN', 'POKHARA'] as const

type District = typeof DISTRICTS[number]

type FormState = {
  name: string
  address: string
  city: string
  district: District
  lat: string
  lng: string
  phone: string
}

const EMPTY: FormState = {
  name: '',
  address: '',
  city: '',
  district: 'KATHMANDU',
  lat: '',
  lng: '',
  phone: '',
}

type Errors = Partial<Record<keyof FormState, string>>

function validate(f: FormState): Errors {
  const e: Errors = {}
  if (!f.name.trim()) e.name = 'Enter a branch name'
  if (!f.address.trim()) e.address = 'Enter the street address'
  if (!f.district) e.district = 'Select a district'
  if (!f.phone.trim()) e.phone = 'Enter a phone number'

  const lat = Number(f.lat)
  const lng = Number(f.lng)
  if (f.lat === '' || Number.isNaN(lat) || lat < -90 || lat > 90)
    e.lat = 'Latitude must be between -90 and 90'
  if (f.lng === '' || Number.isNaN(lng) || lng < -180 || lng > 180)
    e.lng = 'Longitude must be between -180 and 180'
  return e
}

interface Props {
  merchantId: string
  /** When provided, renders in edit mode with pre-filled fields */
  branch?: Branch
  /** Custom trigger element (e.g. Edit button in a table row) */
  trigger?: React.ReactNode
  /** Controlled open state */
  open?: boolean
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void
  onUpdated?: () => void
  onCreated?: () => void
}

export function BranchForm({ merchantId, branch, trigger, open: controlledOpen, onOpenChange, onUpdated, onCreated }: Props) {
  const { merchantId: authMerchantId } = useAuthStore();
  const effectiveMerchantId = merchantId || authMerchantId;
  const { createBranch, updateBranch, isLoading } = useBranch()
  const isEditMode = !!branch

  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = (next: boolean) => {
    if (onOpenChange) {
      onOpenChange(next)
    } else {
      setInternalOpen(next)
    }
  }

  const [form, setForm] = React.useState<FormState>(EMPTY)
  const [errors, setErrors] = React.useState<Errors>({})
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [operatingHours, setOperatingHours] = React.useState<Record<string, { open: string; close: string; closed?: boolean }>>({})

  // Default operating hours for all days
  const getDefaultOperatingHours = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const defaultHours: Record<string, { open: string; close: string; closed?: boolean }> = {}
    days.forEach(day => {
      defaultHours[day] = { open: '09:00', close: '22:00', closed: false }
    })
    return defaultHours
  }

  // Populate form when editing
  React.useEffect(() => {
    if (open && branch) {
      setForm({
        name: branch.name,
        address: branch.address,
        city: branch.city || '',
        district: (branch.district as District) || 'KATHMANDU',
        lat: String(branch.lat),
        lng: String(branch.lng),
        phone: branch.phone,
      })
      setOperatingHours(branch.operatingHours || getDefaultOperatingHours())
    } else if (!open) {
      setForm(EMPTY)
      setErrors({})
      setServerError(null)
      setOperatingHours({})
    } else if (open && !branch) {
      // Create mode - initialize with default operating hours
      setOperatingHours(getDefaultOperatingHours())
    }
  }, [open, branch])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setForm(EMPTY)
      setErrors({})
      setServerError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validate(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setServerError(null)

    if (isEditMode) {
      const payload: UpdateBranchDto = {
        name: form.name.trim(),
        address: form.address.trim(),
        district: form.district,
        lat: Number(form.lat),
        lng: Number(form.lng),
        phone: form.phone.trim() || '',
        operatingHours: Object.keys(operatingHours).length > 0 ? operatingHours : getDefaultOperatingHours(),
      }
      await updateBranch(effectiveMerchantId || '', branch!.id, payload)
      handleOpenChange(false)
      onUpdated?.()
    } else {
      const payload: CreateBranchDto = {
        name: form.name.trim(),
        address: form.address.trim(),
        district: form.district,
        lat: Number(form.lat),
        lng: Number(form.lng),
        phone: form.phone.trim() || '',
        operatingHours: Object.keys(operatingHours).length > 0 ? operatingHours : getDefaultOperatingHours(),
      }
      await createBranch(effectiveMerchantId || '', payload)
      handleOpenChange(false)
      onCreated?.()
    }
  }

  const defaultTrigger = trigger || (
    isEditMode ? (
      <Button variant="ghost" size="sm">
        <Pencil className="h-4 w-4 mr-1" />
        Edit
      </Button>
    ) : (
      <Button size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Add Branch
      </Button>
    )
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {controlledOpen === undefined && (
        <div onClick={() => setOpen(true)} className="inline-block cursor-pointer">
          {defaultTrigger}
        </div>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update branch information' : 'Add a new branch to your merchant account'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Branch Name" id="name" error={errors.name}>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Downtown Store"
              />
            </Field>
            <Field label="Address" id="address" error={errors.address}>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street address"
              />
            </Field>
            <Field label="District" id="district" error={errors.district}>
              <Select value={form.district} onValueChange={(value) => setForm({ ...form, district: value as District })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a district" />
                </SelectTrigger>
                <SelectContent>
                  {DISTRICTS.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Phone" id="phone" error={errors.phone}>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone number"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Latitude" id="lat" error={errors.lat}>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  value={form.lat}
                  onChange={(e) => setForm({ ...form, lat: e.target.value })}
                  placeholder="-90 to 90"
                />
              </Field>
              <Field label="Longitude" id="lng" error={errors.lng}>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  value={form.lng}
                  onChange={(e) => setForm({ ...form, lng: e.target.value })}
                  placeholder="-180 to 180"
                />
              </Field>
            </div>
            <MapPicker
              lat={form.lat ? Number(form.lat) : undefined}
              lng={form.lng ? Number(form.lng) : undefined}
              onLocationChange={(lat, lng) => setForm({ ...form, lat: String(lat), lng: String(lng) })}
            />
            <OperatingHoursBuilder
              value={operatingHours}
              onChange={setOperatingHours}
            />
            {serverError && (
              <div className="text-sm text-destructive">
                {serverError}
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Saving…' : 'Adding…'}
                  </>
                ) : (
                  isEditMode ? 'Save changes' : 'Add branch'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  )
}

export const BranchFormDialog = BranchForm;

function Field({
  label,
  id,
  error,
  hint,
  children,
}: {
  label: string
  id: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-sm text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}