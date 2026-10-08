'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Branch } from '@/lib/types/branch'

interface DeleteBranchDialogProps {
  branch: Branch | null
  onClose: () => void
  onConfirm: (branch: Branch) => void
  isLoading?: boolean
}

export function DeleteBranchDialog({
  branch,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteBranchDialogProps) {
  return (
    <Dialog open={!!branch} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete branch?</DialogTitle>
          <DialogDescription>
            This will permanently remove{' '}
            <span className="font-semibold text-foreground">{branch?.name}</span>. Customers will
            no longer see this location. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => onClose()}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={() => branch && onConfirm(branch)}
          >
            {isLoading ? 'Deleting…' : 'Delete branch'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
