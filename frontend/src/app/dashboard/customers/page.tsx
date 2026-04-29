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
import type { Customer, PaginatedResponse } from '@/types';
import Link from 'next/link';

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: async () => {
      const { data } = await api.get('/customers', {
        params: { page, limit: 20, search: search || undefined },
      });
      return data as PaginatedResponse<Customer>;
    },
  });

  const createMutation = useMutation({
    mutationFn: (customer: Partial<Customer>) => api.post('/customers', customer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setShowModal(false);
      toast.success('تم إنشاء العميل بنجاح');
    },
    onError: () => toast.error('حدث خطأ أثناء إنشاء العميل'),
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      fullName: formData.get('fullName') as string,
      phone: formData.get('phone') as string || undefined,
      email: formData.get('email') as string || undefined,
      address: formData.get('address') as string || undefined,
      city: formData.get('city') as string || undefined,
      area: formData.get('area') as string || undefined,
      nationalId: formData.get('nationalId') as string || undefined,
    });
  };

  const columns = [
    {
      header: 'الاسم',
      cell: (row: Customer) => (
        <Link href={`/dashboard/customers/${row.id}`} className="text-primary-600 hover:underline font-medium">
          {row.fullName}
        </Link>
      ),
    },
    { header: 'الهاتف', accessorKey: 'phone' as keyof Customer },
    { header: 'المدينة', accessorKey: 'city' as keyof Customer },
    {
      header: 'الحسابات',
      cell: (row: Customer) => (
        <span className="badge-info">{row._count?.internetAccounts || 0}</span>
      ),
    },
    {
      header: 'الحالة',
      cell: (row: Customer) => <StatusBadge status={row.status} />,
    },
    {
      header: 'تاريخ الإنشاء',
      cell: (row: Customer) => new Date(row.createdAt).toLocaleDateString('ar'),
    },
  ];

  return (
    <div>
      <Header title="العملاء" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-700">إدارة العملاء</h3>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            إضافة عميل
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
          searchPlaceholder="بحث بالاسم أو الهاتف..."
        />

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="إضافة عميل جديد" size="lg">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">الاسم الكامل *</label>
                <input name="fullName" className="input-field" required />
              </div>
              <div>
                <label className="label">رقم الهاتف</label>
                <input name="phone" className="input-field" />
              </div>
              <div>
                <label className="label">البريد الإلكتروني</label>
                <input name="email" type="email" className="input-field" />
              </div>
              <div>
                <label className="label">رقم الهوية</label>
                <input name="nationalId" className="input-field" />
              </div>
              <div>
                <label className="label">المدينة</label>
                <input name="city" className="input-field" />
              </div>
              <div>
                <label className="label">المنطقة</label>
                <input name="area" className="input-field" />
              </div>
            </div>
            <div>
              <label className="label">العنوان</label>
              <textarea name="address" className="input-field" rows={2} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">إلغاء</button>
              <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء العميل'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
