'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { DataTable } from '@/components/ui/data-table';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { ActiveSession, PaginatedResponse } from '@/types';

function formatBytes(bytes: string | number): string {
  const b = Number(bytes || 0);
  if (b === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${parseFloat((b / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatDuration(seconds: number): string {
  if (!seconds) return '-';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}س ${m}د`;
}

export default function SessionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['sessions', page, search],
    queryFn: async () => {
      const { data } = await api.get('/sessions/active', {
        params: { page, limit: 20, search: search || undefined },
      });
      return data as PaginatedResponse<ActiveSession>;
    },
    refetchInterval: 15000,
  });

  const disconnectMutation = useMutation({
    mutationFn: (sessionId: string) => api.post(`/sessions/${sessionId}/disconnect`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('تم إرسال أمر الفصل');
    },
    onError: () => toast.error('حدث خطأ أثناء الفصل'),
  });

  const columns = [
    { header: 'اسم المستخدم', accessorKey: 'username' as keyof ActiveSession },
    {
      header: 'العميل',
      cell: (row: ActiveSession) => row.customerName || '-',
    },
    {
      header: 'IP',
      cell: (row: ActiveSession) => row.framedipaddress || '-',
    },
    {
      header: 'الراوتر',
      cell: (row: ActiveSession) => row.routerName || row.nasipaddress,
    },
    {
      header: 'المدة',
      cell: (row: ActiveSession) => formatDuration(row.acctsessiontime || 0),
    },
    {
      header: 'تحميل',
      cell: (row: ActiveSession) => formatBytes(row.acctoutputoctets || '0'),
    },
    {
      header: 'رفع',
      cell: (row: ActiveSession) => formatBytes(row.acctinputoctets || '0'),
    },
    {
      header: 'إجراءات',
      cell: (row: ActiveSession) => (
        <button
          onClick={() => disconnectMutation.mutate(row.acctuniqueid)}
          className="btn-danger text-xs py-1 px-3"
          disabled={disconnectMutation.isPending}
        >
          فصل
        </button>
      ),
    },
  ];

  return (
    <div>
      <Header title="الجلسات النشطة" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-700">
            المتصلون حالياً
            {data?.meta?.total ? (
              <span className="badge-success mr-2">{data.meta.total} متصل</span>
            ) : null}
          </h3>
        </div>

        <DataTable
          columns={columns}
          data={data?.data || []}
          page={page}
          totalPages={data?.meta?.totalPages || 1}
          total={data?.meta?.total || 0}
          onPageChange={setPage}
          loading={isLoading}
          onSearch={setSearch}
          searchPlaceholder="بحث بالاسم أو IP..."
        />
      </div>
    </div>
  );
}
