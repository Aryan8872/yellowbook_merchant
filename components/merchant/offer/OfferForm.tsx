'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Upload, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Offer } from '@/lib/types/offer'
import { useAuthStore } from '@/lib/auth'
import { useCreateOffer, useUpdateOffer } from '@/lib/merchant/hooks/use-offers-query'
import { Category } from '@/lib/api/categories-api'
import { useCategories } from '@/lib/merchant/hooks/use-categories-query'
import { useBranches } from '@/lib/merchant/hooks/use-branches-query'
import { uploadOfferCoverImage, uploadOfferGalleryImage } from '@/lib/api/merchant/offers-api'
import { showFormErrors } from '@/lib/utils/form-toast'
import { cleanPayload } from '@/lib/utils/payload-cleanup'

const offerSchema = z.object({
  title: z.string().min(1, 'Enter an offer title'),
  description: z.string().min(1, 'Enter a description'),
  terms: z.string().optional(),
  categoryId: z.string().min(1, 'Select a category'),
  originalPriceNpr: z.string().min(1, 'Enter original price'),
  discountPercentage: z.string().optional(),
  coverImage: z.string().optional(),
  images: z.array(z.string()).optional(),
  highlights: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true
        const lines = val.split('\n').map((h) => h.trim()).filter(Boolean)
        return lines.length <= 5
      },
      { message: 'Maximum 5 highlights allowed (one per line)' }
    )
    .refine(
      (val) => {
        if (!val) return true
        const lines = val.split('\n').map((h) => h.trim()).filter(Boolean)
        return lines.every((line) => line.length <= 50)
      },
      { message: 'Each highlight must be 50 characters or less' }
    ),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  isActive: z.boolean(),
  allBranches: z.boolean(),
  branchIds: z.array(z.string()),
})

type OfferFormData = z.infer<typeof offerSchema>

interface Props {
  /** When provided, renders in edit mode with pre-filled fields */
  offer?: Offer
  /** Custom trigger element (e.g. Edit button in a table row) */
  trigger?: React.ReactNode
  /** Controlled open state */
  open?: boolean
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void
  onCreated?: () => void
  onUpdated?: () => void
}

export function OfferFormDialog({ offer, trigger, open: controlledOpen, onOpenChange, onCreated, onUpdated }: Props) {
  const isEditMode = !!offer
  const { merchantId } = useAuthStore()
  const createOfferMutation = useCreateOffer(merchantId || '')
  const updateOfferMutation = useUpdateOffer(merchantId || '')

  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = (next: boolean) => {
    if (onOpenChange) {
      onOpenChange(next)
    } else {
      setInternalOpen(next)
    }
  }

  const { data: categoriesData } = useCategories()
  const categories = categoriesData || []
  const { data: branchesData } = useBranches(merchantId || '', { limit: 100 })
  const branches = branchesData?.data || []

  const [coverImageFile, setCoverImageFile] = React.useState<File | null>(null)
  const [imageFiles, setImageFiles] = React.useState<File[]>([])

  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: '',
      description: '',
      terms: '',
      categoryId: '',
      originalPriceNpr: '',
      discountPercentage: '',
      coverImage: '',
      images: [],
      highlights: '',
      validFrom: '',
      validUntil: '',
      isActive: true,
      allBranches: true,
      branchIds: [],
    },
  })

  const { reset, register, watch, setValue, formState: { errors } } = form

  // Populate form when editing or resetting
  React.useEffect(() => {
    if (open && offer) {
      const explicitBranches = (offer as any).branches || []
      const explicitBranchIds = (offer as any).branchIds || explicitBranches.map((b: any) => b.id)
      const hasSpecificBranches = Array.isArray(explicitBranchIds) && explicitBranchIds.length > 0 && explicitBranchIds.length < (branches.length || 1)

      reset({
        title: offer.title,
        description: offer.description,
        terms: offer.terms || '',
        categoryId: offer.categoryId || (categories.length > 0 ? categories[0].id : ''),
        originalPriceNpr: String(offer.originalPriceNpr || ''),
        discountPercentage: String(offer.discountPercentage || ''),
        coverImage: (offer as any).coverImage || '',
        images: (offer as any).images || [],
        highlights: (offer.highlights || []).join('\n'),
        validFrom: offer.validFrom ? new Date(offer.validFrom).toISOString().split('T')[0] : '',
        validUntil: offer.validUntil ? new Date(offer.validUntil).toISOString().split('T')[0] : '',
        isActive: offer.isActive ?? true,
        allBranches: !hasSpecificBranches,
        branchIds: explicitBranchIds || [],
      })
    } else if (open && !offer) {
      // New offer opened: preset with first category if not already set
      reset({
        title: '',
        description: '',
        terms: '',
        categoryId: categories.length > 0 ? categories[0].id : '',
        originalPriceNpr: '',
        discountPercentage: '',
        coverImage: '',
        images: [],
        highlights: '',
        validFrom: '',
        validUntil: '',
        isActive: true,
        allBranches: true,
        branchIds: [],
      })
    }
  }, [open, offer, categories.length, branches.length, reset])

  function handleOpenChange(next: boolean) {
    if (createOfferMutation.isPending || updateOfferMutation.isPending) return
    setOpen(next)
    if (!next) {
      reset()
      setCoverImageFile(null)
      setImageFiles([])
    }
  }

  const onSubmit = async (data: OfferFormData) => {
    if (!merchantId) {
      toast.error('No merchant ID found')
      return
    }

    const payload: any = {
      title: data.title.trim(),
      description: data.description.trim(),
      terms: data.terms?.trim() || undefined,
      categoryId: data.categoryId,
      estimatedSavingsNpr: 0, // Default value since field was removed from form
      originalPriceNpr: Number(data.originalPriceNpr),
      discountPercentage: Number(data.discountPercentage) || undefined,
      coverImage: data.coverImage?.trim() || undefined,
      images: data.images || [],
      highlights: data.highlights ? data.highlights.split('\n').map(h => h.trim()).filter(Boolean) : [],
      validFrom: data.validFrom ? new Date(data.validFrom).toISOString() : undefined,
      validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : undefined,
      isActive: data.isActive,
      branchIds: data.allBranches ? [] : (data.branchIds || []),
    }

    try {
      if (isEditMode && offer) {
        // Clean payload to remove null/undefined values for update
        const cleanedPayload = cleanPayload(payload)

        // Upload cover image if new file selected
        if (coverImageFile) {
          toast.loading('Uploading cover image...', { id: 'offer-upload' })
          const coverResponse = await uploadOfferCoverImage(merchantId, offer.id, coverImageFile)
          if (coverResponse.success && coverResponse.data) {
            cleanedPayload.coverImage = coverResponse.data.url
          }
        }

        // Upload gallery images if new files selected
        if (imageFiles.length > 0) {
          toast.loading(`Uploading ${imageFiles.length} gallery image(s)...`, { id: 'offer-upload' })
          for (const imageFile of imageFiles) {
            const galleryResponse = await uploadOfferGalleryImage(merchantId, offer.id, imageFile)
            if (galleryResponse.success && galleryResponse.data) {
              cleanedPayload.images = galleryResponse.data.images
            }
          }
        }

        toast.loading('Saving offer details...', { id: 'offer-upload' })
        await updateOfferMutation.mutateAsync({ offerId: offer.id, data: cleanedPayload })
        toast.dismiss('offer-upload')
        handleOpenChange(false)
        onUpdated?.()
      } else {
        toast.loading('Creating offer...', { id: 'offer-upload' })
        // For create, don't clean payload as required fields must be present
        const createdOffer = await createOfferMutation.mutateAsync(payload)

        if (!createdOffer?.data) {
          toast.dismiss('offer-upload')
          return
        }

        const newOfferId = createdOffer.data.id

        // Upload cover image if selected
        if (coverImageFile) {
          try {
            toast.loading('Uploading cover image...', { id: 'offer-upload' })
            await uploadOfferCoverImage(merchantId, newOfferId, coverImageFile)
            toast.success('Cover image uploaded successfully')
          } catch (err: any) {
            const errDetail = err?.data?.message || err?.message || 'Failed to upload cover image'
            console.error('Failed to upload cover image:', err)
            toast.error(`Offer created, but cover image failed: ${errDetail}`)
          }
        }

        // Upload gallery images if selected
        if (imageFiles.length > 0) {
          try {
            toast.loading(`Uploading ${imageFiles.length} gallery image(s)...`, { id: 'offer-upload' })
            for (const imageFile of imageFiles) {
              await uploadOfferGalleryImage(merchantId, newOfferId, imageFile)
            }
            toast.success('Gallery images uploaded successfully')
          } catch (err: any) {
            const errDetail = err?.data?.message || err?.message || 'Failed to upload gallery images'
            console.error('Failed to upload gallery image:', err)
            toast.error(`Offer created, but gallery image failed: ${errDetail}`)
          }
        }

        toast.dismiss('offer-upload')
        handleOpenChange(false)
        onCreated?.()
      }
    } catch (error) {
      toast.dismiss('offer-upload')
      // Error is handled by the mutation's onError callback
      // Dialog stays open on error
    }
  }

  const defaultTrigger = isEditMode ? (
    <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
      <Pencil className="mr-2 h-4 w-4" />
      Edit
    </Button>
  ) : (
    <Button type="button" onClick={() => setOpen(true)}>
      <Plus className="mr-2 h-4 w-4" />
      Create Offer
    </Button>
  )

  return (
    <>
      {controlledOpen === undefined && (
        trigger ? (
          <span onClick={() => setOpen(true)} className="contents">
            {trigger}
          </span>
        ) : (
          defaultTrigger
        )
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit offer' : 'Create offer'}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Update this offer details.'
                : 'Create a new offer to attract customers.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit((data) => {
            if (Object.keys(form.formState.errors).length > 0) {
              showFormErrors(form.formState.errors)
              return
            }
            onSubmit(data)
          })} className="space-y-4">
            <Field label="Offer Title" id="offer-title" error={form.formState.errors.title?.message}>
              <Input
                id="offer-title"
                placeholder="e.g. 50% Off All Items"
                {...form.register('title')}
              />
            </Field>
            <Field label="Description" id="offer-description" error={form.formState.errors.description?.message}>
              <Textarea
                id="offer-description"
                placeholder="Describe your offer..."
                rows={3}
                {...form.register('description')}
              />
            </Field>
            <Field label="Terms & Conditions" id="offer-terms">
              <Textarea
                id="offer-terms"
                placeholder="Terms and conditions..."
                rows={2}
                {...form.register('terms')}
              />
            </Field>
            <Field label="Category" id="offer-category" error={form.formState.errors.categoryId?.message}>
              <Select value={form.watch('categoryId') || ''} onValueChange={(val) => val && form.setValue('categoryId', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Original Price (NPR)" id="offer-original-price" error={form.formState.errors.originalPriceNpr?.message}>
                <Input
                  id="offer-original-price"
                  type="number"
                  placeholder="1000"
                  {...form.register('originalPriceNpr')}
                />
              </Field>
              <Field label="Discount %" id="offer-discount" error={form.formState.errors.discountPercentage?.message}>
                <Input
                  id="offer-discount"
                  type="number"
                  placeholder="50"
                  {...form.register('discountPercentage')}
                />
              </Field>
            </div>

            <Field label="Cover Image" id="offer-cover-image">
              <div className="space-y-3">
                {(form.watch('coverImage') || coverImageFile) && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                    <img 
                      src={coverImageFile ? URL.createObjectURL(coverImageFile) : form.watch('coverImage')} 
                      alt="Cover" 
                      className="w-full h-full object-cover" 
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        form.setValue('coverImage', '')
                        setCoverImageFile(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    id="offer-cover-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={(el) => {
                      if (el) {
                        const coverImageInput = el as HTMLInputElement;
                        (window as any).coverImageInput = coverImageInput;
                      }
                    }}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setCoverImageFile(file)
                        toast.info(`Cover image selected: ${file.name} (${Math.round(file.size / 1024)} KB)`)
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      const input = (window as any).coverImageInput as HTMLInputElement;
                      if (input) input.click();
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {form.watch('coverImage') || coverImageFile ? 'Change Cover Image' : 'Upload Cover Image'}
                  </Button>
                </div>
              </div>
            </Field>

            <Field label="Gallery Images" id="offer-gallery-images">
              <div className="space-y-3">
                {((form.watch('images')?.length || 0) > 0 || imageFiles.length > 0) && (
                  <div className="grid grid-cols-4 gap-2">
                    {form.watch('images')?.map((img, idx) => (
                      <div key={`existing-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border">
                        <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => {
                            const currentImages = form.watch('images') || []
                            form.setValue('images', currentImages.filter((_, i) => i !== idx))
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {imageFiles.map((file, idx) => (
                      <div key={`new-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border">
                        <img src={URL.createObjectURL(file)} alt={`New Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => {
                            setImageFiles(imageFiles.filter((_, i) => i !== idx))
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    id="offer-gallery-images"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={(el) => {
                      if (el) {
                        const galleryImageInput = el as HTMLInputElement;
                        (window as any).galleryImageInput = galleryImageInput;
                      }
                    }}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setImageFiles([...imageFiles, file])
                        toast.info(`Gallery image added: ${file.name} (${Math.round(file.size / 1024)} KB)`)
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      const input = (window as any).galleryImageInput as HTMLInputElement;
                      if (input) input.click();
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Add Gallery Image
                  </Button>
                </div>
              </div>
            </Field>

            <Field label="Highlights" id="offer-highlights">
              <Textarea
                id="offer-highlights"
                placeholder="One highlight per line"
                rows={3}
                {...form.register('highlights')}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Valid From" id="offer-valid-from">
                <Input
                  id="offer-valid-from"
                  type="date"
                  {...form.register('validFrom')}
                />
              </Field>
              <Field label="Valid Until" id="offer-valid-until">
                <Input
                  id="offer-valid-until"
                  type="date"
                  {...form.register('validUntil')}
                />
              </Field>
            </div>

            {/* Branch Allocation */}
            <div className="space-y-3 rounded-lg border p-4 bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Branch Availability</Label>
                  <p className="text-xs text-muted-foreground">
                    Select where this offer can be claimed and displayed on maps.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="offer-all-branches"
                  checked={form.watch('allBranches')}
                  onCheckedChange={(checked) => {
                    const isAll = !!checked
                    form.setValue('allBranches', isAll)
                    if (isAll) {
                      form.setValue('branchIds', [])
                    }
                  }}
                />
                <Label htmlFor="offer-all-branches" className="cursor-pointer font-medium">
                  Apply to all branches ({branches.length})
                </Label>
              </div>

              {!form.watch('allBranches') && (
                <div className="mt-3 space-y-2 border-t pt-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Choose specific branch locations:
                  </p>
                  {branches.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No branches registered yet.</p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2 max-h-48 overflow-y-auto pr-1">
                      {branches.map((branch) => {
                        const currentIds = form.watch('branchIds') || []
                        const isSelected = currentIds.includes(branch.id)
                        return (
                          <div
                            key={branch.id}
                            className="flex items-center space-x-2 rounded-md border p-2 text-sm hover:bg-accent/40"
                          >
                            <Checkbox
                              id={`branch-${branch.id}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                const next = checked
                                  ? [...currentIds, branch.id]
                                  : currentIds.filter((id) => id !== branch.id)
                                form.setValue('branchIds', next)
                              }}
                            />
                            <Label
                              htmlFor={`branch-${branch.id}`}
                              className="cursor-pointer text-xs font-normal leading-tight"
                            >
                              <span className="font-semibold">{branch.name}</span>
                              <span className="block text-muted-foreground text-[10px]">
                                {branch.address} {branch.district ? `(${branch.district})` : ''}
                              </span>
                            </Label>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {form.watch('branchIds')?.length === 0 && (
                    <p className="text-xs text-amber-600">
                      Please select at least one branch, or toggle "Apply to all branches".
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="offer-active"
                checked={form.watch('isActive')}
                onCheckedChange={(checked) => form.setValue('isActive', checked as boolean)}
              />
              <Label htmlFor="offer-active" className="cursor-pointer">
                Active Offer
              </Label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={createOfferMutation.isPending || updateOfferMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createOfferMutation.isPending || updateOfferMutation.isPending}>
                {createOfferMutation.isPending || updateOfferMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Saving…' : 'Creating…'}
                  </>
                ) : (
                  isEditMode ? 'Save changes' : 'Create offer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

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
