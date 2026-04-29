'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await api.get('/settings');
      return data.data as Array<{ key: string; value: unknown; description?: string }>;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.patch('/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('تم حفظ الإعدادات');
    },
    onError: () => toast.error('حدث خطأ'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    updateMutation.mutate(data);
  };

  const settingLabels: Record<string, string> = {
    company_name: 'اسم الشركة',
    default_currency: 'العملة الافتراضية',
    expiration_grace_period_hours: 'فترة السماح (ساعات)',
    notify_before_expiration_days: 'إشعار قبل الانتهاء (أيام)',
    default_radius_session_timeout: 'مهلة الجلسة الافتراضية (ثوان)',
    invoice_prefix: 'بادئة رقم الفاتورة',
  };

  return (
    <div>
      <Header title="الإعدادات" />
      <div className="p-6">
        <div className="card max-w-2xl">
          <h3 className="text-lg font-bold mb-6">إعدادات النظام</h3>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {settings?.map((setting) => (
                <div key={setting.key}>
                  <label className="label">
                    {settingLabels[setting.key] || setting.key}
                  </label>
                  <input
                    name={setting.key}
                    className="input-field"
                    defaultValue={
                      typeof setting.value === 'string'
                        ? setting.value
                        : JSON.stringify(setting.value)
                    }
                  />
                  {setting.description && (
                    <p className="text-xs text-gray-400 mt-1">{setting.description}</p>
                  )}
                </div>
              ))}
              <div className="pt-4">
                <button type="submit" className="btn-primary" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
