// مصدر الحقيقة الوحيد للأدوار — يجب أن يطابق enum Role في Prisma
export const ROLES = {
  ADMIN: 'ADMIN',
  DESK: 'DESK',
  CUSTOMER: 'CUSTOMER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
