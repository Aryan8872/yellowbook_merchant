'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useMerchantRedemptionsStore } from '@/lib/merchant/stores/redemptions-store';
import { useAuthStore } from '@/lib/auth';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { Redemption } from '@/lib/api/merchant/redemptions-api';

// Must mirror the backend RedemptionStatus enum (prisma/schema.prisma)
const REDEMPTION_STATUS = {
  INIT: 'INIT',
  PENDING_SYNC: 'PENDING_SYNC',
  REDEEMED: 'REDEEMED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
} as const;

export default function RedemptionsPage() {
  const { merchantId } = useAuthStore();
  const {
    redemptions,
    pagination,
    loading,
    fetchRedemptions,
  } = useMerchantRedemptionsStore();

  const [currentPage, setCurrentPage] = useState(1);
  const limit = pagination?.limit || 20;
  const total = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');

  const loadData = useCallback((targetPage: number = 1) => {
    if (merchantId) {
      setCurrentPage(targetPage);
      fetchRedemptions(merchantId, {
        page: targetPage,
        limit,
        search: search.trim() || undefined,
        status: status || undefined,
      });
    }
  }, [merchantId, limit, search, status, fetchRedemptions]);

  const hasFetchedRef = useRef(false);
  useEffect(() => {
    if (merchantId && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchRedemptions(merchantId, { page: 1, limit });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantId]);

  const handleSearch = () => {
    loadData(1);
  };

  const handleFilter = () => {
    loadData(1);
  };

  const handlePageChange = (newPage: number) => {
    loadData(newPage);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case REDEMPTION_STATUS.REDEEMED:
        return 'default';
      case REDEMPTION_STATUS.INIT:
      case REDEMPTION_STATUS.PENDING_SYNC:
        return 'secondary';
      case REDEMPTION_STATUS.REJECTED:
        return 'destructive';
      case REDEMPTION_STATUS.EXPIRED:
        return 'outline';
      default:
        return 'outline';
    }
  };

  const columns: any[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }: any) => <span className="font-medium">{row.original.code}</span>,
    },
    {
      accessorKey: 'offer',
      header: 'Offer',
      cell: ({ row }: any) => (
        <div>
          <p className="font-medium">{row.original.offer.title}</p>
          <p className="text-sm text-muted-foreground">{row.original.offer.category}</p>
        </div>
      ),
    },
    {
      accessorKey: 'user',
      header: 'Customer',
      cell: ({ row }: any) => (
        <div>
          <p className="font-medium">{row.original.user.name}</p>
          <p className="text-sm text-muted-foreground">{row.original.user.phone}</p>
        </div>
      ),
    },
    {
      accessorKey: 'branch',
      header: 'Branch',
      cell: ({ row }: any) => <span>{row.original.branch.name}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={getStatusColor(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }: any) => (
        <span>{new Date(row.original.createdAt).toLocaleDateString()}</span>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }: any) => (
        <span className="font-medium">Rs. {row.original.offer.originalPriceNpr}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Redemptions</h1>
        <p className="text-muted-foreground">
          View and manage customer redemptions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Redemptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by code..."
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={status} onValueChange={(value) => setStatus(value || '')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value={REDEMPTION_STATUS.INIT}>Initiated</SelectItem>
                <SelectItem value={REDEMPTION_STATUS.PENDING_SYNC}>Pending Sync</SelectItem>
                <SelectItem value={REDEMPTION_STATUS.REDEEMED}>Redeemed</SelectItem>
                <SelectItem value={REDEMPTION_STATUS.REJECTED}>Rejected</SelectItem>
                <SelectItem value={REDEMPTION_STATUS.EXPIRED}>Expired</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button onClick={handleFilter}>
              <Filter className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={redemptions}
        isLoading={loading}
        manualPagination
        pageCount={totalPages}
        rowCount={total}
        pageIndex={currentPage - 1}
        onPageChange={(zeroBasedPage) => handlePageChange(zeroBasedPage + 1)}
        showToolbar={false}
        emptyMessage="No redemptions found."
      />
    </div>
  );
}
