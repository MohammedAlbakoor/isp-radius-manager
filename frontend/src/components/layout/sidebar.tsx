'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  HomeIcon,
  UsersIcon,
  CubeIcon,
  WifiIcon,
  CreditCardIcon,
  ServerIcon,
  SignalIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/auth-context';

const navigation = [
  { name: 'لوحة التحكم', href: '/dashboard', icon: HomeIcon },
  { name: 'العملاء', href: '/dashboard/customers', icon: UsersIcon },
  { name: 'حسابات الإنترنت', href: '/dashboard/accounts', icon: WifiIcon },
  { name: 'الباقات', href: '/dashboard/packages', icon: CubeIcon },
  { name: 'الاشتراكات', href: '/dashboard/subscriptions', icon: CreditCardIcon },
  { name: 'المدفوعات', href: '/dashboard/payments', icon: CreditCardIcon },
  { name: 'الراوترات', href: '/dashboard/routers', icon: ServerIcon },
  { name: 'الجلسات النشطة', href: '/dashboard/sessions', icon: SignalIcon },
  { name: 'التقارير', href: '/dashboard/reports', icon: ChartBarIcon },
  { name: 'سجل العمليات', href: '/dashboard/audit-logs', icon: ClipboardDocumentListIcon },
  { name: 'المستخدمون', href: '/dashboard/admin-users', icon: UserGroupIcon },
  { name: 'الإعدادات', href: '/dashboard/settings', icon: Cog6ToothIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed right-0 top-0 h-full w-64 bg-gray-900 text-white flex flex-col z-40">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-primary-400">ISP Manager</h1>
        <p className="text-gray-400 text-xs mt-1">إدارة شبكات الإنترنت</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-6 py-3 text-sm transition-colors',
                isActive
                  ? 'bg-primary-600/20 text-primary-400 border-l-4 border-primary-400'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white',
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold">
            {user?.fullName?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.fullName}</p>
            <p className="text-xs text-gray-400 truncate">{user?.roles?.[0]}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-full"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
