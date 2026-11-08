/** حالة فارغة داخل الجداول والبطاقات */
export function EmptyState({ children = "لا توجد سجلات لعرضها." }: { children?: React.ReactNode }) {
  return <div className="empty-state">{children}</div>;
}

/** حالة تحميل داخل الجداول والبطاقات */
export function LoadingState({ children = "جارٍ التحميل…" }: { children?: React.ReactNode }) {
  return <div className="loading-state">{children}</div>;
}
