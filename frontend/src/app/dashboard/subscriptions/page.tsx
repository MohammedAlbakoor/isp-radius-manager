'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import api from '@/lib/api';
import type { Subscription, PaginatedResponse } from '@/types';

export default function SubscriptionsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['subscriptions', page],
    queryFn: async () => {
      const { data } = await api.get('/subscriptions', { params: { page, limit: 20 } });
      return data as PaginatedResponse<Subscription>;
    },
  });

  const columns = [
    {
      header: 'العميل',
      cell: (row: Subscription) => row.internetAccount?.customer?.fullName || '-',
    },
    {
      header: 'اسم المستخدم',
      cell: (row: Subscription) => row.internetAccount?.username || '-',
    },
    {
      header: 'الباقة',
      cell: (row: Subscription) => row.package?.name || '-',
    },
    {
      header: 'البداية',
      cell: (row: Subscription) => new Date(row.startsAt).toLocaleDateString('ar'),
    },
    {
      header: 'الانتهاء',
      cell: (row: Subscription) => new Date(row.endsAt).toLocaleDateString('ar'),
    },
    {
      header: 'الحالة',
      cell: (row: Subscription) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div>
      <Header title="الاشتراكات" />
      <div className="p-6">
        <DataTable
          columns={columns}
          data={data?.data || []}
          page={page}
          totalPages={data?.meta?.totalPages || 1}
          total={data?.meta?.total || 0}
          onPageChange={setPage}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
