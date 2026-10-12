'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ShieldX, AlertTriangle, Loader2 } from 'lucide-react';
import { useFraudFlagsStore } from '@/lib/admin/stores/fraud-flags-store';
import type { FraudFlag } from '@/lib/api/admin/fraud-flags-api';

interface FraudReviewDialogProps {
  flag: FraudFlag | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FraudReviewDialog({ flag, open, onOpenChange }: FraudReviewDialogProps) {
  const { reviewFlag } = useFraudFlagsStore();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReview = async (resolution: 'DISMISS' | 'ESCALATE' | 'RESOLVE') => {
    if (!flag) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await reviewFlag({
        fraudFlagId: flag.id,
        resolution,
        notes: notes.trim() || undefined,
      });
      if (result.success) {
        setNotes('');
        onOpenChange(false);
      } else {
        setError(result.message || 'Failed to review flag');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!flag) return null;

  const reasonLabel = flag.reason
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Review Fraud Flag
          </DialogTitle>
          <DialogDescription>
            Review and resolve this fraud flag. Your action will be logged.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Flag Details */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Reason</span>
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                {reasonLabel}
              </Badge>
            </div>
            {flag.redemptionSession && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Offer</span>
                  <span className="font-medium truncate max-w-[200px]">
                    {flag.redemptionSession.offer?.title || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Merchant</span>
                  <span className="font-medium">
                    {flag.redemptionSession.offer?.merchant?.name || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">User</span>
                  <span className="font-medium">
                    {flag.redemptionSession.user?.email || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Code</span>
                  <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                    {flag.redemptionSession.redemptionCode}
                  </span>
                </div>
              </>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Reported</span>
              <span className="text-xs">{new Date(flag.reportedAt).toLocaleString()}</span>
            </div>
          </div>

          {flag.notes && (
            <div className="rounded-lg border p-3 text-sm">
              <p className="text-muted-foreground text-xs mb-1 font-medium">Original Notes</p>
              <p>{flag.notes}</p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground" htmlFor="review-notes">
              Review Notes (optional)
            </label>
            <Textarea
              id="review-notes"
              placeholder="Add notes for your decision..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="text-sm resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={() => handleReview('DISMISS')}
            disabled={isSubmitting}
            className="flex-1 border-slate-300"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldX className="h-4 w-4 mr-1" />}
            Dismiss
          </Button>
          <Button
            variant="outline"
            onClick={() => handleReview('ESCALATE')}
            disabled={isSubmitting}
            className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4 mr-1" />}
            Escalate
          </Button>
          <Button
            onClick={() => handleReview('RESOLVE')}
            disabled={isSubmitting}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-1" />}
            Resolve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
