import { clsx } from 'clsx';

const statusStyles: Record<string, string> = {
  active: 'badge-success',
  online: 'badge-success',
  paid: 'badge-success',
  healthy: 'badge-success',
  inactive: 'badge-gray',
  offline: 'badge-gray',
  disabled: 'badge-gray',
  pending: 'badge-info',
  draft: 'badge-info',
  suspended: 'badge-warning',
  maintenance: 'badge-warning',
  expiring: 'badge-warning',
  partially_paid: 'badge-warning',
  expired: 'badge-danger',
  blacklisted: 'badge-danger',
  unreachable: 'badge-danger',
  failed: 'badge-danger',
  refunded: 'badge-danger',
  cancelled: 'badge-danger',
};

const statusLabels: Record<string, string> = {
  active: 'نشط',
  inactive: 'غير نشط',
  blacklisted: 'محظور',
  suspended: 'معلق',
  expired: 'منتهي',
  disabled: 'معطل',
  pending: 'قيد الانتظار',
  paid: 'مدفوع',
  failed: 'فشل',
  refunded: 'مسترجع',
  online: 'متصل',
  offline: 'غير متصل',
  maintenance: 'صيانة',
  unreachable: 'غير متاح',
  cancelled: 'ملغي',
  draft: 'مسودة',
  issued: 'صادرة',
  partially_paid: 'مدفوع جزئياً',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={clsx(statusStyles[status] || 'badge-gray')}>
      {statusLabels[status] || status}
    </span>
  );
}
