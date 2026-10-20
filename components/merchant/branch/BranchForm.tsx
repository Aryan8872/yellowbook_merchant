'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { useCreateBranch, useUpdateBranch } from '@/lib/merchant/hooks/use-branches-query'
import { useAuthStore } from '@/lib/auth/auth-store'
import { OperatingHoursBuilder } from './OperatingHoursBuilder'
import { MapPicker } from './MapPicker'
import { showFormErrors } from '@/lib/utils/form-toast'
import { cleanPayload } from '@/lib/utils/payload-cleanup'

const DISTRICTS = ['JHAPA', 'KATHMANDU', 'CHITWAN', 'POKHARA'] as const

type District = typeof DISTRICTS[number]

const branchSchema = z.object({
  name: z.string().min(1, 'Enter a branch name'),
  address: z.string().min(1, 'Enter the street address'),
  district: z.enum(['JHAPA', 'KATHMANDU', 'CHITWAN', 'POKHARA']),
  lat: z.string().refine((val) => {
    const num = Number(val)
    return !Number.isNaN(num) && num >= -90 && num <= 90
  }, 'Latitude must be between -90 and 90'),
  lng: z.string().refine((val) => {
    const num = Number(val)
    return !Number.isNaN(num) && num >= -180 && num <= 180
  }, 'Longitude must be between -180 and 180'),
  phone: z.string().min(1, 'Enter a phone number'),
})

type BranchFormData = z.infer<typeof branchSchema>

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
  const createBranchMutation = useCreateBranch(effectiveMerchantId || '')
  const updateBranchMutation = useUpdateBranch(effectiveMerchantId || '')
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

  const form = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: '',
      address: '',
      district: 'KATHMANDU',
      lat: '',
      lng: '',
      phone: '',
    },
  })

  const { reset } = form

  // Populate form when editing
  React.useEffect(() => {
    if (open && branch) {
      reset({
        name: branch.name,
        address: branch.address,
        district: (branch.district as District) || 'KATHMANDU',
        lat: String(branch.lat),
        lng: String(branch.lng),
        phone: branch.phone,
      })
      setOperatingHours(branch.operatingHours || getDefaultOperatingHours())
    } else if (!open) {
      reset()
      setOperatingHours({})
    } else if (open && !branch) {
      // Create mode - initialize with default operating hours
      setOperatingHours(getDefaultOperatingHours())
    }
  }, [open, branch, reset])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      reset()
      setOperatingHours({})
    }
  }

  const onSubmit = async (data: BranchFormData) => {
    const payload = {
      name: data.name.trim(),
      address: data.address.trim(),
      district: data.district,
      lat: Number(data.lat),
      lng: Number(data.lng),
      phone: data.phone.trim() || '',
      operatingHours: Object.keys(operatingHours).length > 0 ? operatingHours : getDefaultOperatingHours(),
    }

    // Clean payload to remove null/undefined values
    const cleanedPayload = cleanPayload(payload)

    try {
      if (isEditMode && branch) {
        await updateBranchMutation.mutateAsync({ branchId: branch.id, data: cleanedPayload as any })
        handleOpenChange(false)
        onUpdated?.()
      } else {
        await createBranchMutation.mutateAsync(cleanedPayload as CreateBranchDto)
        handleOpenChange(false)
        onCreated?.()
      }
    } catch (error) {
      // Error is handled by the mutation's onError callback
      // Dialog stays open on error
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="pb-2 border-b">
          <DialogTitle className="text-xl font-semibold">{isEditMode ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isEditMode ? 'Update branch details, location coordinates, and weekly operating hours.' : 'Add a new physical branch to your merchant account with location and hours.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((data) => {
          if (Object.keys(form.formState.errors).length > 0) {
            showFormErrors(form.formState.errors)
            return
          }
          onSubmit(data)
        })} className="space-y-6 pt-2">
          {/* Section 1: Branch Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Branch Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Branch Name" id="name" error={form.formState.errors.name?.message}>
                <Input
                  id="name"
                  placeholder="e.g. Kathmandu Downtown Store"
                  {...form.register('name')}
                />
              </Field>
              <Field label="Contact Phone" id="phone" error={form.formState.errors.phone?.message}>
                <Input
                  id="phone"
                  placeholder="e.g. +977 1 4455667"
                  {...form.register('phone')}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Field label="Street Address" id="address" error={form.formState.errors.address?.message}>
                  <Input
                    id="address"
                    placeholder="Street or locality address"
                    {...form.register('address')}
                  />
                </Field>
              </div>
              <div>
                <Field label="District" id="district" error={form.formState.errors.district?.message}>
                  <Select value={form.watch('district')} onValueChange={(value) => form.setValue('district', value as District)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
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
              </div>
            </div>
          </div>

          {/* Section 2: Coordinates & Location */}
          <div className="space-y-4 pt-2 border-t">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location & Coordinates</h4>
              <span className="text-xs text-muted-foreground">Click map or drag pin to update</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Latitude" id="lat" error={form.formState.errors.lat?.message}>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  placeholder="e.g. 27.7172"
                  {...form.register('lat')}
                />
              </Field>
              <Field label="Longitude" id="lng" error={form.formState.errors.lng?.message}>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  placeholder="e.g. 85.3240"
                  {...form.register('lng')}
                />
              </Field>
            </div>
            <div className="rounded-md border overflow-hidden">
              <MapPicker
                lat={form.watch('lat') ? Number(form.watch('lat')) : undefined}
                lng={form.watch('lng') ? Number(form.watch('lng')) : undefined}
                onLocationChange={(lat, lng) => {
                  form.setValue('lat', String(lat))
                  form.setValue('lng', String(lng))
                }}
              />
            </div>
          </div>

          {/* Section 3: Operating Hours */}
          <div className="space-y-4 pt-2 border-t">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Operating Schedule</h4>
            <OperatingHoursBuilder
              value={operatingHours}
              onChange={setOperatingHours}
            />
          </div>

          <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createBranchMutation.isPending || updateBranchMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createBranchMutation.isPending || updateBranchMutation.isPending}>
              {createBranchMutation.isPending || updateBranchMutation.isPending ? (
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