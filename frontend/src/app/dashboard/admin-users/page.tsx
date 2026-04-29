'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { DataTable } from '@/components/ui/data-table';
import api from '@/lib/api';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  isActive: boolean;
  lastLoginAt?: string;
  userRoles: Array<{ role: { displayName: string } }>;
  branch?: { name: string };
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: async () => {
      const { data } = await api.get('/admin-users', { params: { page, limit: 20 } });
      return data;
    },
  });

  const columns = [
    { header: 'الاسم', accessorKey: 'fullName' as keyof AdminUser },
    { header: 'اسم المستخدم', accessorKey: 'username' as keyof AdminUser },
    { header: 'البريد', accessorKey: 'email' as keyof AdminUser },
    {
      header: 'الأدوار',
      cell: (row: AdminUser) =>
        row.userRoles?.map((ur) => ur.role.displayName).join(', ') || '-',
    },
    {
      header: 'الفرع',
      cell: (row: AdminUser) => row.branch?.name || 'الكل',
    },
    {
      header: 'الحالة',
      cell: (row: AdminUser) => (
        <span className={row.isActive ? 'badge-success' : 'badge-danger'}>
          {row.isActive ? 'نشط' : 'معطل'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <Header title="المستخدمون الإداريون" />
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
