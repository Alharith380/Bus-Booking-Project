// نوع الرحلة: مجدولة تلقائياً أو إضافية (طارئة)
export const TRIP_TYPE = {
  SCHEDULED: 'SCHEDULED',
  MANUAL: 'MANUAL',
} as const;

export type TripType = (typeof TRIP_TYPE)[keyof typeof TRIP_TYPE];
