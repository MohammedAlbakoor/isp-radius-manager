'use client';

import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import api from '@/lib/api';

export default function ReportsPage() {
  const { data: usageData } = useQuery({
    queryKey: ['usage-report'],
    queryFn: async () => {
      const { data } = await api.get('/reports/usage');
      return data.data;
    },
  });

  const { data: routerHealth } = useQuery({
    queryKey: ['router-health'],
    queryFn: async () => {
      const { data } = await api.get('/reports/router-health');
      return data.data;
    },
  });

  return (
    <div>
      <Header title="التقارير" />
      <div className="p-6 space-y-6">
        <div className="card">
          <h3 className="text-lg font-bold mb-4">أكثر المستخدمين استهلاكاً</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-right">المستخدم</th>
                  <th className="px-4 py-2 text-right">التحميل</th>
                  <th className="px-4 py-2 text-right">الرفع</th>
                  <th className="px-4 py-2 text-right">الجلسات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {usageData?.map((u: Record<string, unknown>, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{String(u.username)}</td>
                    <td className="px-4 py-2">{formatBytes(u.totalDownload)}</td>
                    <td className="px-4 py-2">{formatBytes(u.totalUpload)}</td>
                    <td className="px-4 py-2">{String(u.sessionCount)}</td>
                  </tr>
                )) || (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">لا توجد بيانات</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold mb-4">حالة الراوترات</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-right">الراوتر</th>
                  <th className="px-4 py-2 text-right">IP</th>
                  <th className="px-4 py-2 text-right">الفرع</th>
                  <th className="px-4 py-2 text-right">المشتركون</th>
                  <th className="px-4 py-2 text-right">آخر ظهور</th>
                  <th className="px-4 py-2 text-right">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {routerHealth?.map((r: Record<string, unknown>) => (
                  <tr key={String(r.id)} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{String(r.name)}</td>
                    <td className="px-4 py-2">{String(r.nasIp)}</td>
                    <td className="px-4 py-2">{(r.branch as Record<string, unknown>)?.name as string || '-'}</td>
                    <td className="px-4 py-2">{String((r._count as Record<string, unknown>)?.internetAccounts || 0)}</td>
                    <td className="px-4 py-2">
                      {r.lastSeenAt ? new Date(String(r.lastSeenAt)).toLocaleString('ar') : '-'}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`badge ${r.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                        {r.status === 'active' ? 'متصل' : 'غير متصل'}
                      </span>
                    </td>
                  </tr>
                )) || (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">لا توجد بيانات</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatBytes(bytes: unknown): string {
  const b = Number(bytes || 0);
  if (b === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${parseFloat((b / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
