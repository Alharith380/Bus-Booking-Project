import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

/** زر بأسلوب نظام التصميم: primary | outline | ghost */
export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  return (
    <button className={cn("button", `button--${variant}`, className)} {...props}>
      {children}
    </button>
  );
}
