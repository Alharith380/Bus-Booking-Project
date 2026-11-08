/**
 * أسماء ملفات الارتباط (cookies) الخاصة بالجلسة.
 * يُستعمل الملف نفسه من التطبيق ومن proxy لضمان التطابق.
 */
export const TOKEN_COOKIE = "bm_token";
export const ROLE_COOKIE = "bm_role";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 أيام
