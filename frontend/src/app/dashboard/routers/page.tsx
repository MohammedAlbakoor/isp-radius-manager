'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Header } from '@/components/layout/header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { Router, PaginatedResponse } from '@/types';

export default function RoutersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['routers', page, search],
    queryFn: async () => {
      const { data } = await api.get('/routers', {
        params: { page, limit: 20, search: search || undefined },
      });
      return data as PaginatedResponse<Router>;
    },
  });

  const createMutation = useMutation({
    mutationFn: (router: Record<string, unknown>) => api.post('/routers', router),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routers'] });
      setShowModal(false);
      toast.success('تم إضافة الراوتر بنجاح');
    },
    onError: () => toast.error('حدث خطأ'),
  });

  const testMutation = useMutation({
    mutationFn: (id: string) => api.post(`/routers/${id}/test-connection`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routers'] });
      toast.success('الاتصال ناجح');
    },
    onError: () => toast.error('فشل الاتصال بالراوتر'),
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      name: formData.get('name'),
      nasIp: formData.get('nasIp'),
      radiusSecret: formData.get('radiusSecret'),
      apiUsername: formData.get('apiUsername') || undefined,
      apiPassword: formData.get('apiPassword') || undefined,
      location: formData.get('location') || undefined,
    });
  };

  const columns = [
    { header: 'الاسم', accessorKey: 'name' as keyof Router },
    { header: 'NAS IP', accessorKey: 'nasIp' as keyof Router },
    {
      header: 'الفرع',
      cell: (row: Router) => row.branch?.name || '-',
    },
    {
      header: 'المشتركون',
      cell: (row: Router) => row._count?.internetAccounts || 0,
    },
    {
      header: 'آخر ظهور',
      cell: (row: Router) =>
        row.lastSeenAt ? new Date(row.lastSeenAt).toLocaleString('ar') : '-',
    },
    {
      header: 'الحالة',
      cell: (row: Router) => <StatusBadge status={row.status} />,
    },
    {
      header: 'إجراءات',
      cell: (row: Router) => (
        <button
          onClick={() => testMutation.mutate(row.id)}
          className="btn-secondary text-xs py-1 px-3 flex items-center gap-1"
          disabled={testMutation.isPending}
        >
          <ArrowPathIcon className="w-3 h-3" />
          اختبار
        </button>
      ),
    },
  ];

  return (
    <div>
      <Header title="الراوترات" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-700">إدارة الراوترات</h3>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            إضافة راوتر
          </button>
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
        />

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="إضافة راوتر جديد">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label">اسم الراوتر *</label>
              <input name="name" className="input-field" required />
            </div>
            <div>
              <label className="label">NAS IP *</label>
              <input name="nasIp" className="input-field" required placeholder="192.168.1.1" />
            </div>
            <div>
              <label className="label">RADIUS Secret *</label>
              <input name="radiusSecret" type="password" className="input-field" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">API Username</label>
                <input name="apiUsername" className="input-field" placeholder="admin" />
              </div>
              <div>
                <label className="label">API Password</label>
                <input name="apiPassword" type="password" className="input-field" />
              </div>
            </div>
            <div>
              <label className="label">الموقع</label>
              <input name="location" className="input-field" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">إلغاء</button>
              <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'جاري الإضافة...' : 'إضافة الراوتر'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
