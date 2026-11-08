"use client";

import { useEffect, useState } from "react";
import { defer, toDateInputValue } from "@/lib/utils";

/** القيمة المبدئية الممكنة لحقل تاريخ */
export type DateDefault = "today" | "month-start";

/** اشتقاق القيمة المبدئية — يُنفَّذ على المتصفح لا أثناء العرض */
function resolveDefault(defaultValue: DateDefault): string {
  const now = new Date();
  if (defaultValue === "month-start") {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  }
  return toDateInputValue(now);
}

/**
 * حقل تاريخ قابل للتحكم يبدأ بقيمة مبدئية تُحسب بعد التحميل.
 *
 * قراءة `new Date()` أثناء العرض تُثبَّت التاريخ في الهيكل الساكن عند البناء،
 * فيفتح التطبيق بتاريخ يوم البناء؛ ولذلك تُؤجَّل القراءة إلى ما بعد التأثير.
 * القيمة تبدأ فارغة حتى تصل، فتتطابق الصفحة المُصيَّرة مع المتصفح عند الربط.
 */
export function useDateInput(defaultValue: DateDefault): [string, (value: string) => void] {
  const [value, setValue] = useState("");

  useEffect(() => {
    defer(() => setValue(resolveDefault(defaultValue)));
  }, [defaultValue]);

  return [value, setValue];
}
