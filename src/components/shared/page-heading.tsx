import type { ReactNode } from "react";

interface PageHeadingProps {
  title: string;
  subtitle: string;
  /** زر الإجراء الرئيسي في أعلى الصفحة */
  action?: ReactNode;
}

/** ترويسة الصفحة داخل مساحة المحتوى: عنوان + وصف + إجراء */
export function PageHeading({ title, subtitle, action }: PageHeadingProps) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
