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
import type { InternetAccount, PaginatedResponse, Package, Customer } from '@/types';
import Link from 'next/link';

export default function AccountsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['accounts', page, search],
    queryFn: async () => {
      const { data } = await api.get('/internet-accounts', {
        params: { page, limit: 20, search: search || undefined },
      });
      return data as PaginatedResponse<InternetAccount>;
    },
  });

  const { data: packages } = useQuery({
    queryKey: ['packages-list'],
    queryFn: async () => {
      const { data } = await api.get('/packages', { params: { limit: 100 } });
      return data.data as Package[];
    },
  });

  const { data: customers } = useQuery({
    queryKey: ['customers-list'],
    queryFn: async () => {
      const { data } = await api.get('/customers', { params: { limit: 100 } });
      return data.data as Customer[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (account: Record<string, unknown>) => api.post('/internet-accounts', account),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setShowModal(false);
      toast.success('تم إنشاء حساب الإنترنت بنجاح');
    },
    onError: () => toast.error('حدث خطأ أثناء إنشاء الحساب'),
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      customerId: formData.get('customerId'),
      username: formData.get('username'),
      password: formData.get('password'),
      serviceType: formData.get('serviceType'),
      packageId: formData.get('packageId'),
    });
  };

  const columns = [
    {
      header: 'اسم المستخدم',
      cell: (row: InternetAccount) => (
        <Link href={`/dashboard/accounts/${row.id}`} className="text-primary-600 hover:underline font-medium">
          {row.username}
        </Link>
      ),
    },
    {
      header: 'العميل',
      cell: (row: InternetAccount) => row.customer?.fullName || '-',
    },
    {
      header: 'النوع',
      cell: (row: InternetAccount) => row.serviceType === 'pppoe' ? 'PPPoE' : 'Hotspot',
    },
    {
      header: 'الباقة',
      cell: (row: InternetAccount) => row.package?.name || '-',
    },
    {
      header: 'الحالة',
      cell: (row: InternetAccount) => <StatusBadge status={row.status} />,
    },
    {
      header: 'الانتهاء',
      cell: (row: InternetAccount) =>
        row.expiresAt ? new Date(row.expiresAt).toLocaleDateString('ar') : '-',
    },
  ];

  return (
    <div>
      <Header title="حسابات الإنترنت" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-700">إدارة حسابات الإنترنت</h3>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            إضافة حساب
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
          searchPlaceholder="بحث بالاسم..."
        />

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="إضافة حساب إنترنت جديد">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label">العميل *</label>
              <select name="customerId" className="input-field" required>
                <option value="">اختر العميل</option>
                {customers?.map((c) => (
                  <option key={c.id} value={c.id}>{c.fullName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">اسم المستخدم *</label>
              <input name="username" className="input-field" required />
            </div>
            <div>
              <label className="label">كلمة المرور *</label>
              <input name="password" type="password" className="input-field" required />
            </div>
            <div>
              <label className="label">نوع الخدمة *</label>
              <select name="serviceType" className="input-field" required>
                <option value="pppoe">PPPoE</option>
                <option value="hotspot">Hotspot</option>
              </select>
            </div>
            <div>
              <label className="label">الباقة *</label>
              <select name="packageId" className="input-field" required>
                <option value="">اختر الباقة</option>
                {packages?.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">إلغاء</button>
              <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
