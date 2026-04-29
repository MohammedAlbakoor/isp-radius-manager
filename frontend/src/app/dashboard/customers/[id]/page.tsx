'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { StatusBadge } from '@/components/ui/status-badge';
import api from '@/lib/api';
import type { Customer } from '@/types';
import Link from 'next/link';

export default function CustomerDetailPage() {
  const params = useParams();

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', params.id],
    queryFn: async () => {
      const { data } = await api.get(`/customers/${params.id}`);
      return data.data as Customer;
    },
  });

  if (isLoading) {
    return (
      <div>
        <Header title="تفاصيل العميل" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div>
      <Header title={`العميل: ${customer.fullName}`} />
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card lg:col-span-1">
            <h3 className="text-lg font-bold mb-4">معلومات العميل</h3>
            <div className="space-y-3">
              <div><span className="text-gray-500 text-sm">الاسم:</span> <span className="font-medium">{customer.fullName}</span></div>
              <div><span className="text-gray-500 text-sm">الهاتف:</span> <span>{customer.phone || '-'}</span></div>
              <div><span className="text-gray-500 text-sm">البريد:</span> <span>{customer.email || '-'}</span></div>
              <div><span className="text-gray-500 text-sm">المدينة:</span> <span>{customer.city || '-'}</span></div>
              <div><span className="text-gray-500 text-sm">العنوان:</span> <span>{customer.address || '-'}</span></div>
              <div><span className="text-gray-500 text-sm">الحالة:</span> <StatusBadge status={customer.status} /></div>
            </div>
          </div>

          <div className="card lg:col-span-2">
            <h3 className="text-lg font-bold mb-4">حسابات الإنترنت</h3>
            {customer.internetAccounts && customer.internetAccounts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-right">اسم المستخدم</th>
                      <th className="px-4 py-2 text-right">النوع</th>
                      <th className="px-4 py-2 text-right">الباقة</th>
                      <th className="px-4 py-2 text-right">الحالة</th>
                      <th className="px-4 py-2 text-right">الانتهاء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {customer.internetAccounts.map((acc) => (
                      <tr key={acc.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <Link href={`/dashboard/accounts/${acc.id}`} className="text-primary-600 hover:underline">
                            {acc.username}
                          </Link>
                        </td>
                        <td className="px-4 py-2">{acc.serviceType === 'pppoe' ? 'PPPoE' : 'Hotspot'}</td>
                        <td className="px-4 py-2">{acc.package?.name || '-'}</td>
                        <td className="px-4 py-2"><StatusBadge status={acc.status} /></td>
                        <td className="px-4 py-2">
                          {acc.expiresAt ? new Date(acc.expiresAt).toLocaleDateString('ar') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">لا توجد حسابات</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
