'use client';

import { useQuery } from '@tanstack/react-query';
import {
  UsersIcon, WifiIcon, SignalIcon, ServerIcon,
  CurrencyDollarIcon, ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Header } from '@/components/layout/header';
import { StatCard } from '@/components/ui/stat-card';
import api from '@/lib/api';
import type { DashboardData } from '@/types';

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/reports/dashboard');
      return data.data as DashboardData;
    },
    refetchInterval: 30000,
  });

  return (
    <div>
      <Header title="لوحة التحكم" />
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="إجمالي العملاء"
                value={data.customers.total}
                icon={UsersIcon}
                color="blue"
              />
              <StatCard
                title="حسابات نشطة"
                value={data.accounts.active}
                icon={WifiIcon}
                color="green"
              />
              <StatCard
                title="متصلون الآن"
                value={data.sessions.online}
                icon={SignalIcon}
                color="purple"
                subtitle="جلسات نشطة"
              />
              <StatCard
                title="حسابات معلقة"
                value={data.accounts.suspended}
                icon={ExclamationTriangleIcon}
                color="yellow"
              />
              <StatCard
                title="حسابات منتهية"
                value={data.accounts.expired}
                icon={ExclamationTriangleIcon}
                color="red"
              />
              <StatCard
                title="تنتهي اليوم"
                value={data.subscriptions.expiringToday}
                icon={ExclamationTriangleIcon}
                color="yellow"
                subtitle="اشتراكات"
              />
              <StatCard
                title="الراوترات النشطة"
                value={`${data.routers.active} / ${data.routers.total}`}
                icon={ServerIcon}
                color="blue"
              />
              <StatCard
                title="الإيرادات (30 يوم)"
                value={`$${Number(data.revenue.last30Days).toFixed(2)}`}
                icon={CurrencyDollarIcon}
                color="green"
                subtitle={`${data.revenue.transactionCount} عملية`}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-bold text-gray-800 mb-4">ملخص الحسابات</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">نشطة</span>
                    <span className="badge-success">{data.accounts.active}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">معلقة</span>
                    <span className="badge-warning">{data.accounts.suspended}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">منتهية</span>
                    <span className="badge-danger">{data.accounts.expired}</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-bold text-gray-800 mb-4">ملخص الاشتراكات</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">اشتراكات نشطة</span>
                    <span className="badge-success">{data.subscriptions.active}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">تنتهي اليوم</span>
                    <span className="badge-warning">{data.subscriptions.expiringToday}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
