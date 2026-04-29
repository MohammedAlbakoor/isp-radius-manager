'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { StatusBadge } from '@/components/ui/status-badge';
import api from '@/lib/api';
import type { InternetAccount } from '@/types';

export default function AccountDetailPage() {
  const params = useParams();

  const { data: account, isLoading } = useQuery({
    queryKey: ['account', params.id],
    queryFn: async () => {
      const { data } = await api.get(`/internet-accounts/${params.id}`);
      return data.data as InternetAccount;
    },
  });

  if (isLoading) {
    return (
      <div>
        <Header title="تفاصيل الحساب" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!account) return null;

  return (
    <div>
      <Header title={`حساب: ${account.username}`} />
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-bold mb-4">معلومات الحساب</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">اسم المستخدم:</span> <span className="font-medium">{account.username}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">العميل:</span> <span>{account.customer?.fullName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">النوع:</span> <span>{account.serviceType === 'pppoe' ? 'PPPoE' : 'Hotspot'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">الباقة:</span> <span>{account.package?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">الحالة:</span> <StatusBadge status={account.status} /></div>
              <div className="flex justify-between"><span className="text-gray-500">الانتهاء:</span> <span>{account.expiresAt ? new Date(account.expiresAt).toLocaleDateString('ar') : '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">IP ثابت:</span> <span>{account.staticIp || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">MAC:</span> <span>{account.macAddress || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">الجلسات المسموحة:</span> <span>{account.allowedSimultaneousSessions}</span></div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold mb-4">الاشتراكات</h3>
            {account.subscriptions && account.subscriptions.length > 0 ? (
              <div className="space-y-3">
                {account.subscriptions.map((sub) => (
                  <div key={sub.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{sub.package?.name}</span>
                      <StatusBadge status={sub.status} />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(sub.startsAt).toLocaleDateString('ar')} - {new Date(sub.endsAt).toLocaleDateString('ar')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">لا توجد اشتراكات</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
