import type { ReactNode } from "react";
import { NAV_ICONS } from "@/constants/navigation";

type Tone = "warning" | "danger" | "info";

interface NoticeProps {
  title: string;
  tone?: Tone;
  children: ReactNode;
}

const toneIcon: Record<Tone, string> = {
  warning: NAV_ICONS.alert,
  danger: NAV_ICONS.error,
  info: NAV_ICONS.info,
};

/** صندوق تنبيه بثلاث درجات: warning | danger | info */
export function Notice({ title, tone = "warning", children }: NoticeProps) {
  return (
    <div className={`notice notice--${tone}`}>
      <img src={toneIcon[tone]} alt="" />
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}
