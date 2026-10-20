import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { ReactNode } from 'react'

interface DialogFormProps {
  title: string
  description?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (e: React.FormEvent) => void
  isPending: boolean
  children: ReactNode
  submitButtonText?: string
  cancelButtonText?: string
  showCancelButton?: boolean
  icon?: ReactNode
}

export function DialogForm({
  title,
  description,
  open,
  onOpenChange,
  onSubmit,
  isPending,
  children,
  submitButtonText = 'Save',
  cancelButtonText = 'Cancel',
  showCancelButton = true,
  icon,
}: DialogFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {icon && (
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {icon}
              </div>
              <div>
                <DialogTitle>{title}</DialogTitle>
                {description && <DialogDescription>{description}</DialogDescription>}
              </div>
            </div>
          )}
          {!icon && (
            <>
              <DialogTitle>{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </>
          )}
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-4">
          {children}

          <DialogFooter>
            {showCancelButton && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                {cancelButtonText}
              </Button>
            )}
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                submitButtonText
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
