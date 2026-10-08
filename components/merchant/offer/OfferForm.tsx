'use client'

import * as React from 'react'
import { Plus, Pencil, Upload, X } from 'lucide-react'

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
import { useMerchantOffersStore } from '@/lib/merchant/stores/offers-store'
import { getCategories, Category } from '@/lib/api/categories-api'
import { uploadOfferCoverImage, uploadOfferGalleryImage, createOffer as apiCreateOffer, updateOffer as apiUpdateOffer } from '@/lib/api/merchant/offers-api'

type FormState = {
  title: string
  description: string
  terms: string
  categoryId: string | null
  originalPriceNpr: string
  discountPercentage: string
  coverImage: string
  coverImageFile: File | null
  images: string[]
  imageFiles: File[]
  highlights: string
  validFrom: string
  validUntil: string
  isActive: boolean
}

const EMPTY: FormState = {
  title: '',
  description: '',
  terms: '',
  categoryId: null,
  originalPriceNpr: '',
  discountPercentage: '',
  coverImage: '',
  coverImageFile: null,
  images: [],
  imageFiles: [],
  highlights: '',
  validFrom: '',
  validUntil: '',
  isActive: true,
}

type Errors = Partial<Record<keyof FormState, string>>

function validate(f: FormState): Errors {
  const e: Errors = {}
  if (!f.title.trim()) e.title = 'Enter an offer title'
  if (!f.description.trim()) e.description = 'Enter a description'
  if (!f.originalPriceNpr.trim()) e.originalPriceNpr = 'Enter original price'
  if (!f.categoryId) e.categoryId = 'Select a category'
  return e
}

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
  const [categories, setCategories] = React.useState<Category[]>([])

  // Fetch categories on mount
  React.useEffect(() => {
    getCategories().then((response) => {
      if (response.success && response.data) {
        setCategories(response.data)
      }
    })
  }, [])

  // Populate form when editing
  React.useEffect(() => {
    if (open && offer) {
      setForm({
        title: offer.title,
        description: offer.description,
        terms: offer.terms || '',
        categoryId: offer.categoryId || '',
        originalPriceNpr: String(offer.originalPriceNpr || ''),
        discountPercentage: String(offer.discountPercentage || ''),
        coverImage: (offer as any).coverImage || '',
        coverImageFile: null,
        images: (offer as any).images || [],
        imageFiles: [],
        highlights: (offer.highlights || []).join('\n'),
        validFrom: offer.validFrom ? new Date(offer.validFrom).toISOString().split('T')[0] : '',
        validUntil: offer.validUntil ? new Date(offer.validUntil).toISOString().split('T')[0] : '',
        isActive: offer.isActive ?? true,
      })
    }
  }, [open, offer])

  const setField =
    (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setForm(EMPTY)
      setErrors({})
      setServerError(null)
    }
  }

  const { merchantId } = useAuthStore()
  const { fetchOffers } = useMerchantOffersStore()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)

    const found = validate(form)
    if (Object.keys(found).length > 0) {
      setErrors(found)
      return
    }

    if (!merchantId) {
      setServerError('No merchant ID found')
      return
    }

    try {
      const payload: any = {
        title: form.title.trim(),
        description: form.description.trim(),
        terms: form.terms.trim() || undefined,
        categoryId: form.categoryId,
        originalPriceNpr: Number(form.originalPriceNpr),
        discountPercentage: Number(form.discountPercentage) || undefined,
        coverImage: form.coverImage.trim() || undefined,
        images: form.images,
        highlights: form.highlights.split('\n').map(h => h.trim()).filter(Boolean),
        validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : undefined,
        validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : undefined,
        isActive: form.isActive,
      }

      if (isEditMode && offer) {
        // Upload cover image if new file selected
        if (form.coverImageFile) {
          const coverResponse = await uploadOfferCoverImage(merchantId, offer.id, form.coverImageFile)
          if (coverResponse.success && coverResponse.data) {
            payload.coverImage = coverResponse.data.url
          }
        }

        // Upload gallery images if new files selected
        for (const imageFile of form.imageFiles) {
          const galleryResponse = await uploadOfferGalleryImage(merchantId, offer.id, imageFile)
          if (galleryResponse.success && galleryResponse.data) {
            payload.images = galleryResponse.data.images
          }
        }

        await apiUpdateOffer(merchantId, offer.id, payload)
        handleOpenChange(false)
        onUpdated?.()
        fetchOffers(merchantId)
      } else {
        console.log('About to call createOffer with merchantId:', merchantId)
        const createdOffer = await apiCreateOffer(merchantId, {
          ...payload,
          estimatedSavingsNpr: form.discountPercentage 
            ? Math.round(Number(form.originalPriceNpr) * (Number(form.discountPercentage) / 100))
            : 0,
        })

        console.log('Created offer response after await:', createdOffer)
        console.log('Created offer response type:', typeof createdOffer)
        console.log('Created offer response success:', createdOffer?.success)
        console.log('Created offer response data:', createdOffer?.data)

        if (!createdOffer?.success || !createdOffer?.data) {
          console.error('Offer creation failed or returned invalid data:', createdOffer)
          setServerError('Failed to create offer')
          return
        }

        // Upload images after offer creation - wait for all uploads to complete
        const uploadErrors: string[] = []
        
        if (form.coverImageFile) {
          try {
            console.log('Uploading cover image for offer:', createdOffer.data.id)
            const coverResult = await uploadOfferCoverImage(merchantId, createdOffer.data.id, form.coverImageFile)
            console.log('Cover image upload result:', coverResult)
          } catch (err: any) {
            console.error('Failed to upload cover image:', err)
            uploadErrors.push('Cover image upload failed')
          }
        }

        for (const imageFile of form.imageFiles) {
          try {
            console.log('Uploading gallery image for offer:', createdOffer.data.id)
            const galleryResult = await uploadOfferGalleryImage(merchantId, createdOffer.data.id, imageFile)
            console.log('Gallery image upload result:', galleryResult)
          } catch (err: any) {
            console.error('Failed to upload gallery image:', err)
            uploadErrors.push('Gallery image upload failed')
          }
        }

        if (uploadErrors.length > 0) {
          setServerError(`Offer created but images failed to upload: ${uploadErrors.join(', ')}`)
          // Still close modal since offer was created successfully
        }

        handleOpenChange(false)
        onCreated?.()
        fetchOffers(merchantId)
      }
    } catch (err: any) {
      setServerError(err?.message || 'Failed to submit offer')
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

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Field label="Offer title" id="offer-title" error={errors.title}>
              <Input
                id="offer-title"
                value={form.title}
                onChange={setField('title')}
                placeholder="50% Off on All Items"
                aria-invalid={!!errors.title}
              />
            </Field>

            <Field label="Description" id="offer-description" error={errors.description}>
              <Textarea
                id="offer-description"
                value={form.description}
                onChange={setField('description')}
                placeholder="Describe your offer..."
                rows={3}
                aria-invalid={!!errors.description}
              />
            </Field>

            <Field label="Category" id="offer-category" error={errors.categoryId}>
              <Select value={form.categoryId ?? ''} onValueChange={(value) => setForm({ ...form, categoryId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Original Price (NPR)" id="offer-original-price" error={errors.originalPriceNpr}>
                <Input
                  id="offer-original-price"
                  type="number"
                  value={form.originalPriceNpr}
                  onChange={setField('originalPriceNpr')}
                  placeholder="1000"
                  aria-invalid={!!errors.originalPriceNpr}
                />
              </Field>
              <Field label="Discount %" id="offer-discount" error={errors.discountPercentage}>
                <Input
                  id="offer-discount"
                  type="number"
                  value={form.discountPercentage}
                  onChange={setField('discountPercentage')}
                  placeholder="50"
                  aria-invalid={!!errors.discountPercentage}
                />
              </Field>
            </div>

            <Field label="Cover Image" id="offer-cover-image">
              <div className="space-y-3">
                {(form.coverImage || form.coverImageFile) && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                    <img 
                      src={form.coverImageFile ? URL.createObjectURL(form.coverImageFile) : form.coverImage} 
                      alt="Cover" 
                      className="w-full h-full object-cover" 
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setForm({ ...form, coverImage: '', coverImageFile: null })}
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
                        setForm({ ...form, coverImageFile: file })
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
                    {form.coverImage || form.coverImageFile ? 'Change Cover Image' : 'Upload Cover Image'}
                  </Button>
                </div>
              </div>
            </Field>

            <Field label="Gallery Images" id="offer-gallery-images">
              <div className="space-y-3">
                {(form.images.length > 0 || form.imageFiles.length > 0) && (
                  <div className="grid grid-cols-4 gap-2">
                    {form.images.map((img, idx) => (
                      <div key={`existing-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border">
                        <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => {
                            setForm({ ...form, images: form.images.filter((_, i) => i !== idx) })
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {form.imageFiles.map((file, idx) => (
                      <div key={`new-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border">
                        <img src={URL.createObjectURL(file)} alt={`New Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => {
                            setForm({ ...form, imageFiles: form.imageFiles.filter((_, i) => i !== idx) })
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
                        setForm({ ...form, imageFiles: [...form.imageFiles, file] })
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

            <Field label="Highlights (one per line)" id="offer-highlights">
              <Textarea
                id="offer-highlights"
                value={form.highlights}
                onChange={setField('highlights')}
                placeholder="Free delivery&#10;Valid for dine-in only&#10;Cannot be combined with other offers"
                rows={3}
              />
            </Field>

            <Field label="Terms & Conditions" id="offer-terms">
              <Textarea
                id="offer-terms"
                value={form.terms}
                onChange={setField('terms')}
                placeholder="Offer valid until stocks last..."
                rows={3}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Valid from" id="offer-valid-from">
                <Input
                  id="offer-valid-from"
                  type="date"
                  value={form.validFrom}
                  onChange={setField('validFrom')}
                />
              </Field>
              <Field label="Valid until" id="offer-valid-until">
                <Input
                  id="offer-valid-until"
                  type="date"
                  value={form.validUntil}
                  onChange={setField('validUntil')}
                />
              </Field>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="offer-active"
                checked={form.isActive}
                onCheckedChange={(checked) => setForm(prev => ({ ...prev, isActive: checked as boolean }))}
              />
              <Label htmlFor="offer-active">Active</Label>
            </div>

            {serverError && (
              <p role="alert" className="text-sm text-destructive">
                {serverError}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditMode ? 'Save changes' : 'Create offer'}
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
