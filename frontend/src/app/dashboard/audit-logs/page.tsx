'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { DataTable } from '@/components/ui/data-table';
import api from '@/lib/api';
import type { AuditLog, PaginatedResponse } from '@/types';

const actionLabels: Record<string, string> = {
  create: 'إنشاء',
  update: 'تعديل',
  delete: 'حذف',
  login: 'تسجيل دخول',
};

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page],
    queryFn: async () => {
      const { data } = await api.get('/audit-logs', { params: { page, limit: 20 } });
      return data as PaginatedResponse<AuditLog>;
    },
  });

  const columns = [
    {
      header: 'المستخدم',
      cell: (row: AuditLog) => row.actor?.fullName || 'النظام',
    },
    {
      header: 'العملية',
      cell: (row: AuditLog) => (
        <span className="badge-info">{actionLabels[row.action] || row.action}</span>
      ),
    },
    { header: 'الكيان', accessorKey: 'entityType' as keyof AuditLog },
    {
      header: 'IP',
      cell: (row: AuditLog) => row.ipAddress || '-',
    },
    {
      header: 'التاريخ',
      cell: (row: AuditLog) => new Date(row.createdAt).toLocaleString('ar'),
    },
  ];

  return (
    <div>
      <Header title="سجل العمليات" />
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
