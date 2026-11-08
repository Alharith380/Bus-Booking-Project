"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QrCodeProps {
  /** النص الخام القادم من الخادم — يُحوَّل إلى رمز دون أي تعديل عليه */
  value: string;
  size?: number;
}

interface Rendered {
  value: string;
  src: string;
}

/** رمز مربّع للتذكرة الإلكترونية */
export function QrCode({ value, size = 168 }: QrCodeProps) {
  const [rendered, setRendered] = useState<Rendered | null>(null);
  const [failedFor, setFailedFor] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    QRCode.toDataURL(value, { width: size, margin: 1, errorCorrectionLevel: "M" }).then(
      (url) => {
        if (!cancelled) setRendered({ value, src: url });
      },
      () => {
        if (!cancelled) setFailedFor(value);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [value, size]);

  // نعرض فقط ما يطابق القيمة الحالية حتى لا يظهر رمز قديم أثناء التوليد
  if (failedFor === value) return <p className="caption">تعذّر توليد الرمز المربّع من هذا النص.</p>;
  if (rendered?.value !== value) return <div className="loading-state">جارٍ توليد الرمز…</div>;

  return <img src={rendered.src} alt="رمز التذكرة الإلكترونية" width={size} height={size} />;
}
