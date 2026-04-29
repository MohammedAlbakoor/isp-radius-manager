'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import api from '@/lib/api';
import type { Payment, PaginatedResponse } from '@/types';

const methodLabels: Record<string, string> = {
  cash: 'نقدي',
  card: 'بطاقة',
  bank_transfer: 'تحويل بنكي',
  wallet: 'محفظة',
  other: 'أخرى',
};

export default function PaymentsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['payments', page],
    queryFn: async () => {
      const { data } = await api.get('/payments', { params: { page, limit: 20 } });
      return data as PaginatedResponse<Payment>;
    },
  });

  const columns = [
    {
      header: 'العميل',
      cell: (row: Payment) => row.customer?.fullName || '-',
    },
    {
      header: 'المبلغ',
      cell: (row: Payment) => `$${Number(row.amount).toFixed(2)}`,
    },
    {
      header: 'طريقة الدفع',
      cell: (row: Payment) => methodLabels[row.method] || row.method,
    },
    {
      header: 'الحالة',
      cell: (row: Payment) => <StatusBadge status={row.status} />,
    },
    {
      header: 'التاريخ',
      cell: (row: Payment) =>
        row.paidAt ? new Date(row.paidAt).toLocaleString('ar') : '-',
    },
    {
      header: 'استلم بواسطة',
      cell: (row: Payment) => row.receivedBy?.fullName || '-',
    },
  ];

  return (
    <div>
      <Header title="المدفوعات" />
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
