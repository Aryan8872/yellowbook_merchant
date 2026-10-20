import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPayments,
  verifyManualPayment,
  type ListPaymentsParams,
  type PaymentTransactionItem,
} from '@/lib/api/admin/payments-api';
import { toast } from 'sonner';

export const paymentsKeys = {
  all: ['admin', 'payments'] as const,
  lists: () => [...paymentsKeys.all, 'list'] as const,
  list: (params: ListPaymentsParams) => [...paymentsKeys.lists(), params] as const,
};

export function usePayments(params: ListPaymentsParams = {}) {
  return useQuery({
    queryKey: paymentsKeys.list(params),
    queryFn: async () => {
      const res = await getPayments(params);
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to load payments');
      }

      // Normalize return shape
      const raw = res.data as any;
      const data: PaymentTransactionItem[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : [];

      const pagination = raw?.pagination || {
        page: params.page || 1,
        limit: params.limit || 20,
        total: data.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };

      return { data, pagination };
    },
  });
}

export function useVerifyManualPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transactionId, notes }: { transactionId: string; notes?: string }) => {
      const res = await verifyManualPayment(transactionId, notes);
      if (!res.success) {
        throw new Error(res.message || 'Manual verification failed');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentsKeys.all });
      toast.success('Payment transaction manually verified & subscription active');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to verify transaction');
    },
  });
}
