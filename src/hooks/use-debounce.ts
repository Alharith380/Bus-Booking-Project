"use client";

import { useEffect, useState } from "react";

/** تأخير القيمة حتى يتوقف المستخدم عن الكتابة — للبحث عن زبون أو موظف */
export function useDebounce<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
