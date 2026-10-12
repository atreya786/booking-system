export const ROLE_PRIORITY: Record<string, number> = {
  ADMIN: 1,
  HOD: 2,
  GUIDE: 3,
  STAFF: 4,
  APPRENTICE: 5,
};

export const BOOKING_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;

export type BookingStatusValue =
  (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];