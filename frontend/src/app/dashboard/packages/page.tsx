'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Header } from '@/components/layout/header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { Package, PaginatedResponse } from '@/types';

export default function PackagesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['packages', page, search],
    queryFn: async () => {
      const { data } = await api.get('/packages', {
        params: { page, limit: 20, search: search || undefined },
      });
      return data as PaginatedResponse<Package>;
    },
  });

  const createMutation = useMutation({
    mutationFn: (pkg: Record<string, unknown>) => api.post('/packages', pkg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      setShowModal(false);
      toast.success('تم إنشاء الباقة بنجاح');
    },
    onError: () => toast.error('حدث خطأ'),
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      name: formData.get('name'),
      downloadSpeed: Number(formData.get('downloadSpeed')),
      uploadSpeed: Number(formData.get('uploadSpeed')),
      price: Number(formData.get('price')),
      durationDays: Number(formData.get('durationDays')),
    });
  };

  const columns = [
    { header: 'اسم الباقة', accessorKey: 'name' as keyof Package },
    {
      header: 'السرعة',
      cell: (row: Package) => `${row.downloadSpeed}${row.speedUnit}/${row.uploadSpeed}${row.speedUnit}`,
    },
    {
      header: 'السعر',
      cell: (row: Package) => `$${Number(row.price).toFixed(2)}`,
    },
    {
      header: 'المدة',
      cell: (row: Package) => `${row.durationDays} يوم`,
    },
    {
      header: 'المشتركون',
      cell: (row: Package) => row._count?.internetAccounts || 0,
    },
    {
      header: 'الحالة',
      cell: (row: Package) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div>
      <Header title="الباقات" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-700">إدارة الباقات</h3>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            إضافة باقة
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
          searchPlaceholder="بحث..."
        />

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="إضافة باقة جديدة">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label">اسم الباقة *</label>
              <input name="name" className="input-field" required placeholder="مثال: Basic 5M" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">سرعة التحميل (Mbps) *</label>
                <input name="downloadSpeed" type="number" className="input-field" required min="1" />
              </div>
              <div>
                <label className="label">سرعة الرفع (Mbps) *</label>
                <input name="uploadSpeed" type="number" className="input-field" required min="1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">السعر *</label>
                <input name="price" type="number" step="0.01" className="input-field" required min="0" />
              </div>
              <div>
                <label className="label">المدة (بالأيام) *</label>
                <input name="durationDays" type="number" className="input-field" required min="1" defaultValue="30" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">إلغاء</button>
              <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء الباقة'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
