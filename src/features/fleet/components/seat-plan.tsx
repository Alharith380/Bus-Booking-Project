"use client";

import type { ReactNode } from "react";
import { NAV_ICONS } from "@/constants/navigation";

/** حالة مقعد بعد توحيد مصدره (قالب مخزّن أو حالة رحلة فعلية) */
export type SeatPlanState = "available" | "held" | "booked" | "inactive";

export interface SeatPlanItem {
  key: string;
  number: string;
  state: SeatPlanState;
}

interface SeatPlanProps {
  /** مثل: «معاينة القالب المحدد» أو «مقاعد الرحلة» */
  title: string;
  caption: string;
  badge?: ReactNode;
  seats: SeatPlanItem[];
  /** المفاتيح المختارة محلياً */
  selectedKeys?: ReadonlySet<string>;
  onSelect?: (key: string) => void;
}

const STATE_CLASS: Record<SeatPlanState, string> = {
  available: "",
  held: "state--held",
  booked: "state--booked",
  inactive: "state--inactive",
};

/** مخطط مقاعد الحافلة: مفتاح + شارة + قمرة + شبكة المقاعد */
export function SeatPlan({ title, caption, badge, seats, selectedKeys, onSelect }: SeatPlanProps) {
  return (
    <section className="card seat-card">
      <h2>{title}</h2>
      {badge}
      <div className="legend">
        <i />
        متاح <i />
        محجوز <i />
        محتجز <i />
        مختار
      </div>
      <div className="bus-cabin">
        <img src={NAV_ICONS.cabin} alt="" />
        <span>مقدمة الحافلة</span>
        <div className="seats">
          {seats.map((seat) => {
            const selected = selectedKeys?.has(seat.key) ?? false;
            const className = [STATE_CLASS[seat.state], selected ? "state--selected" : ""]
              .filter(Boolean)
              .join(" ");
            const disabled = seat.state === "booked" || seat.state === "inactive" || !onSelect;

            return (
              <button
                key={seat.key}
                type="button"
                className={className}
                disabled={disabled}
                aria-pressed={selected}
                aria-label={`المقعد ${seat.number}`}
                onClick={() => onSelect?.(seat.key)}
              >
                {seat.number}
              </button>
            );
          })}
        </div>
      </div>
      <p className="caption">{caption}</p>
    </section>
  );
}
