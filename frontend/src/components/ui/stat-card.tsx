import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  subtitle?: string;
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  red: 'bg-red-50 text-red-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  purple: 'bg-purple-50 text-purple-600',
};

export function StatCard({ title, value, icon: Icon, color = 'blue', subtitle }: StatCardProps) {
  return (
    <div className="card flex items-center gap-4">
      <div className={clsx('p-3 rounded-xl', colorMap[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
