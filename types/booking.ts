export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface Booking {
  appointment_id: number;
  venue_id: number;
  venue_name: string;
  location?: string;
  capacity?: number;
  venue_type?: string;
  requested_by: number;
  requested_by_name: string;
  requested_by_role: string;
  booking_date: string;
  purpose: string;
  description: string;
  status: BookingStatus;
  guide_status: string;
  hod_status: string;
  admin_status: string;
  is_allocated: boolean;
  rejection_reason?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface VenueQueueGroup {
  venue_id: number;
  venue_name: string;
  booking_date: string;
  allocated?: Booking | null;
  waiting: Booking[];
}

export interface DashboardStats {
  totalRequests: number;
  pendingApprovals: number;
  allocatedBookings: number;
  waitingQueue: number;
  activeVenues: number;
  cancelledBookings: number;
}
