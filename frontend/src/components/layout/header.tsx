'use client';

import { BellIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/auth-context';

export function Header({ title }: { title: string }) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:text-gray-700">
          <BellIcon className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <span className="text-sm text-gray-600">{user?.fullName}</span>
      </div>
    </header>
  );
}
