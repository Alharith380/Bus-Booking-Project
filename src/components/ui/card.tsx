import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  title?: string;
  className?: string;
  id?: string;
  children: ReactNode;
}

/** بطاقة بيضاء بحدود وعنوان اختياري */
export function Card({ title, className, id, children }: CardProps) {
  return (
    <section className={cn("card", className)} id={id}>
      {title && <h2>{title}</h2>}
      {children}
    </section>
  );
}
