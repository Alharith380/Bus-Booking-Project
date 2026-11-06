// حالة الرحلة
export const TRIP_STATUS = {
  OPEN: 'OPEN',
  DEPARTED: 'DEPARTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type TripStatus = (typeof TRIP_STATUS)[keyof typeof TRIP_STATUS];
