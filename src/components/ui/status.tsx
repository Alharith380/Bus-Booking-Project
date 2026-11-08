import type { ReactNode } from "react";

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

interface StatusProps {
  tone?: StatusTone;
  children: ReactNode;
}

/** شارة الحالة الدائرية الصغيرة */
export function Status({ tone = "success", children }: StatusProps) {
  return <span className={`status status--${tone}`}>{children}</span>;
}
