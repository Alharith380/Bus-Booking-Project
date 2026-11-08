/** أدوات الواجهة المشتركة */

/** تجميع شروط CSS مع تجاهل الفارغ منها */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** السعر بالليرة السورية بلا فواصل عشرية — الأرقام بصيغة EN لتطابق التصميم */
export function formatPrice(value: number): string {
  return `${value.toLocaleString("en-US")} ل.س`;
}

/** تاريخ بصيغة 8 نوفمبر 2026 بأرقام لاتينية */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("ar-SY-u-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

/**
 * قيمة حقل تاريخ (YYYY-MM-DD) إلى نص عربي.
 * تُبنى التاريخ محلياً فلا ينقل تحويل UTC يوماً إلى الطرف الآخر.
 */
export function formatDateInput(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "";
  return formatDate(new Date(year, month - 1, day).toISOString());
}

/** وقت بصيغة 08:00 */
export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("ar-SY-u-nu-latn", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

/** مغادرة ← وصول: 08:00 – 13:00 */
export function formatTimeRange(startIso: string, endIso: string): string {
  return `${formatTime(startIso)} – ${formatTime(endIso)}`;
}

/** المدة بالدقائق إلى صيغة 05:00 ساعات */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/** تاريخ ISO إلى صيغة YYYY-MM-DD المطلوبة في استعلام الرحلات */
export function toDateInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** الحروف الأولى للاسم لشعار الحساب */
export function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join(" ");
}

/**
 * يبدأ مهمة جلب في مؤجّل بعد التأثير حتى لا تُحدَّث الحالة متزامنة معه.
 * قاعدة `react-hooks/set-state-in-effect` ترفض أي تحديث حالة يقع مباشرة داخل التأثير،
 * ولذلك يمرّ الجلب عبر وعد يُنفَّذ في دورة لاحقة.
 */
export function defer(task: () => void | Promise<void>): void {
  void Promise.resolve().then(task);
}
