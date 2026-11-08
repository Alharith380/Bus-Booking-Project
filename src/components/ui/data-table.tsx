import type { ReactNode } from "react";
import type { PageMeta } from "@/types";
import { EmptyState, LoadingState } from "@/components/ui/states";

export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  meta?: PageMeta;
  onPageChange?: (page: number) => void;
}

/** جدول بيانات متوافق مع قوائم العقد (meta: page/limit/total) */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  emptyMessage,
  meta,
  onPageChange,
}: DataTableProps<T>) {
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!loading &&
            rows.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((column) => (
                  <td key={column.key}>{column.render(row)}</td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
      {loading && <LoadingState />}
      {!loading && rows.length === 0 && <EmptyState>{emptyMessage}</EmptyState>}
      {meta && (
        <div className="pagination">
          <span>
            عرض {rows.length} من {meta.total} سجل · الصفحة {meta.page} من {totalPages}
          </span>
          {onPageChange && (
            <span>
              <button
                type="button"
                disabled={meta.page <= 1}
                onClick={() => onPageChange(meta.page - 1)}
              >
                السابق
              </button>
              {"　"}
              <button
                type="button"
                disabled={meta.page >= totalPages}
                onClick={() => onPageChange(meta.page + 1)}
              >
                التالي
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
