'use client';

import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  onSearch?: (search: string) => void;
  searchPlaceholder?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  page,
  totalPages,
  total,
  onPageChange,
  loading,
  onSearch,
  searchPlaceholder,
}: DataTableProps<T>) {
  return (
    <div className="card p-0 overflow-hidden">
      {onSearch && (
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder={searchPlaceholder || 'بحث...'}
            className="input-field max-w-sm"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                    جاري التحميل...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  لا توجد بيانات
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 text-sm text-gray-700">
                      {col.cell
                        ? col.cell(row)
                        : col.accessorKey
                          ? String(row[col.accessorKey] ?? '-')
                          : '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
        <span className="text-sm text-gray-500">
          إجمالي: {total} | صفحة {page} من {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-1.5 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-1.5 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
