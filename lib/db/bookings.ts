import sql from "mssql";
import connectDB from "../db";
import { validateBooking } from "../utils/booking-validation";
import { updateVenueAllocation } from "../utils/allocation";
import {
  Booking,
  VenueQueueGroup,
  DashboardStats,
} from "@/types/booking";

export async function getBookings(): Promise<Booking[]> {
  const pool = await connectDB();

  const result = await pool?.request().query<Booking>(`
    SELECT
      b.*,
      u.name AS requested_by_name,
      u.role AS requested_by_role,
      v.venue_name,
      v.location,
      v.capacity,
      v.venue_type
    FROM Bookings b
    JOIN Users u
      ON b.requested_by = u.user_id
    JOIN Venues v
      ON b.venue_id = v.venue_id
    ORDER BY b.created_at DESC
  `);

  return result?.recordset || [];
}

export async function getBookingsByUserId(
  user_id: number,
): Promise<Booking[]> {
  const pool = await connectDB();

  const result = await pool?.request().input("user_id", sql.Int, user_id)
    .query<Booking>(`
      SELECT
        b.*,
        u.name AS requested_by_name,
        u.role AS requested_by_role,
        v.venue_name,
        v.location,
        v.capacity,
        v.venue_type
      FROM Bookings b
      JOIN Users u
        ON b.requested_by = u.user_id
      JOIN Venues v
        ON b.venue_id = v.venue_id
      WHERE
        b.requested_by = @user_id
      ORDER BY
        b.created_at DESC
    `);

  return result?.recordset || [];
}

export async function getBookingById(id: number): Promise<Booking | null> {
  const pool = await connectDB();

  const result = await pool?.request().input("id", sql.Int, id)
    .query<Booking>(`
      SELECT
        b.*,
        u.name AS requested_by_name,
        u.role AS requested_by_role,
        v.venue_name,
        v.location,
        v.capacity,
        v.venue_type
      FROM Bookings b
      JOIN Users u
        ON b.requested_by = u.user_id
      JOIN Venues v
        ON b.venue_id = v.venue_id
      WHERE
        b.appointment_id = @id
    `);

  return result?.recordset[0] || null;
}

export async function createBooking(data: {
  venue_id: number;
  requested_by: number;
  booking_date: string;
  purpose: string;
  description: string;
}) {
  const pool = await connectDB();

  if (!pool) {
    throw new Error("Database connection failed");
  }

  // Validate working hours, past dates, blocked dates, inactive venues, and duplicates
  await validateBooking(data.venue_id, data.booking_date, data.requested_by);

  const result = await pool
    .request()
    .input("venue_id", sql.Int, data.venue_id)
    .input("requested_by", sql.Int, data.requested_by)
    .input("booking_date", sql.Date, data.booking_date)
    .input("purpose", sql.NVarChar(255), data.purpose)
    .input("description", sql.NVarChar(sql.MAX), data.description).query(`
      INSERT INTO Bookings (
        venue_id,
        requested_by,
        booking_date,
        purpose,
        description,
        status,
        guide_status,
        hod_status,
        admin_status,
        current_approval_level,
        priority_level,
        is_allocated,
        created_at
      )
      OUTPUT INSERTED.appointment_id
      VALUES (
        @venue_id,
        @requested_by,
        @booking_date,
        @purpose,
        @description,
        'PENDING',
        'PENDING',
        'PENDING',
        'PENDING',
        'GUIDE',
        4,
        0,
        SYSDATETIME()
      )
    `);

  return result.recordset[0]?.appointment_id;
}

export async function updateBooking(
  data: {
    appointment_id: number;
    venue_id: number;
    booking_date: string;
    purpose: string;
    description: string;
  },
  userId?: number,
  isAdmin?: boolean,
) {
  const pool = await connectDB();

  if (!pool) {
    throw new Error("Database connection failed");
  }

  const existing = await getBookingById(data.appointment_id);
  if (!existing) {
    throw new Error("Booking not found");
  }

  if (userId && !isAdmin && existing.requested_by !== userId) {
    throw new Error("You do not have permission to edit this booking");
  }

  if (existing.status === "REJECTED" || existing.status === "CANCELLED") {
    throw new Error(`Cannot edit a finalized booking (${existing.status})`);
  }

  // If changing venue or date, re-validate
  const venueOrDateChanged =
    existing.venue_id !== data.venue_id ||
    new Date(existing.booking_date).toISOString().split("T")[0] !==
      data.booking_date;

  if (venueOrDateChanged) {
    await validateBooking(
      data.venue_id,
      data.booking_date,
      existing.requested_by,
      data.appointment_id,
    );
  }

  await pool
    .request()
    .input("appointment_id", sql.Int, data.appointment_id)
    .input("venue_id", sql.Int, data.venue_id)
    .input("booking_date", sql.Date, data.booking_date)
    .input("purpose", sql.NVarChar(255), data.purpose)
    .input("description", sql.NVarChar(sql.MAX), data.description).query(`
      UPDATE Bookings
      SET
        venue_id = @venue_id,
        booking_date = @booking_date,
        purpose = @purpose,
        description = @description,
        updated_at = GETDATE()
      WHERE
        appointment_id = @appointment_id
    `);

  // If already approved and venue/date changed, recalculate allocations for old and new
  if (existing.status === "APPROVED" && venueOrDateChanged) {
    await updateVenueAllocation(existing.venue_id, existing.booking_date);
    await updateVenueAllocation(data.venue_id, data.booking_date);
  }
}

export async function cancelBooking(
  appointment_id: number,
  userId?: number,
  isAdmin?: boolean,
) {
  const pool = await connectDB();

  if (!pool) {
    throw new Error("Database connection failed");
  }

  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    // 1. Fetch booking with lock
    const checkReq = new sql.Request(transaction);
    checkReq.input("id", sql.Int, appointment_id);

    const result = await checkReq.query<Booking>(`
      SELECT *
      FROM Bookings WITH (UPDLOCK, ROWLOCK)
      WHERE appointment_id = @id
    `);

    const booking = result.recordset[0];

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status === "CANCELLED") {
      throw new Error("Booking is already cancelled");
    }

    // RBAC: only owner or admin can cancel
    if (userId && !isAdmin && booking.requested_by !== userId) {
      throw new Error("You are not authorized to cancel this booking");
    }

    // 2. Mark booking as CANCELLED and remove allocation
    const cancelReq = new sql.Request(transaction);
    cancelReq.input("id", sql.Int, appointment_id);

    await cancelReq.query(`
      UPDATE Bookings
      SET
        status = 'CANCELLED',
        is_allocated = 0,
        updated_at = GETDATE()
      WHERE
        appointment_id = @id
    `);

    // 3. Recalculate allocation for that venue and date within the same transaction
    await updateVenueAllocation(
      booking.venue_id,
      booking.booking_date,
      transaction,
    );

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function getAllocatedBookings(): Promise<Booking[]> {
  const pool = await connectDB();

  const result = await pool?.request().query<Booking>(`
    SELECT
      b.*,
      u.name AS requested_by_name,
      u.role AS requested_by_role,
      v.venue_name,
      v.location,
      v.capacity
    FROM Bookings b
    JOIN Users u
      ON b.requested_by = u.user_id
    JOIN Venues v
      ON b.venue_id = v.venue_id
    WHERE
      b.status = 'APPROVED'
    AND
      b.is_allocated = 1
    ORDER BY
      b.booking_date ASC
  `);

  return result?.recordset || [];
}

export async function getQueuedBookings(): Promise<Booking[]> {
  const pool = await connectDB();

  const result = await pool?.request().query<Booking>(`
    SELECT
      b.*,
      u.name AS requested_by_name,
      u.role AS requested_by_role,
      v.venue_name,
      v.location,
      v.capacity
    FROM Bookings b
    JOIN Users u
      ON b.requested_by = u.user_id
    JOIN Venues v
      ON b.venue_id = v.venue_id
    WHERE
      b.status = 'APPROVED'
    AND
      b.is_allocated = 0
    ORDER BY
      b.booking_date ASC,
      b.created_at ASC
  `);

  return result?.recordset || [];
}

export async function getVenueQueues(): Promise<VenueQueueGroup[]> {
  const pool = await connectDB();

  const result = await pool?.request().query<Booking>(`
    SELECT
      b.*,
      u.name AS requested_by_name,
      u.role AS requested_by_role,
      v.venue_name,
      v.location,
      v.capacity,
      v.venue_type
    FROM Bookings b
    JOIN Users u
      ON b.requested_by = u.user_id
    JOIN Venues v
      ON b.venue_id = v.venue_id
    WHERE
      b.status = 'APPROVED'
    ORDER BY
      b.booking_date ASC,
      v.venue_name ASC,
      b.created_at ASC
  `);

  const bookings = result?.recordset || [];

  // Group by unique venue_id + date string (YYYY-MM-DD)
  const map = new Map<string, VenueQueueGroup>();

  for (const booking of bookings) {
    const dateFormatted = new Date(booking.booking_date)
      .toISOString()
      .split("T")[0];
    const key = `${booking.venue_id}_${dateFormatted}`;

    if (!map.has(key)) {
      map.set(key, {
        venue_id: booking.venue_id,
        venue_name: booking.venue_name,
        booking_date: dateFormatted,
        allocated: null,
        waiting: [],
      });
    }

    const group = map.get(key)!;
    if (booking.is_allocated) {
      group.allocated = booking;
    } else {
      group.waiting.push(booking);
    }
  }

  return Array.from(map.values());
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const pool = await connectDB();

  if (!pool) {
    return {
      totalRequests: 0,
      pendingApprovals: 0,
      allocatedBookings: 0,
      waitingQueue: 0,
      activeVenues: 0,
      cancelledBookings: 0,
    };
  }

  const result = await pool.request().query<{
    totalRequests: number;
    pendingApprovals: number;
    allocatedBookings: number;
    waitingQueue: number;
    cancelledBookings: number;
    activeVenues: number;
  }>(`
    SELECT
      (SELECT COUNT(*) FROM Bookings) AS totalRequests,
      (SELECT COUNT(*) FROM Bookings WHERE status = 'PENDING') AS pendingApprovals,
      (SELECT COUNT(*) FROM Bookings WHERE status = 'APPROVED' AND is_allocated = 1) AS allocatedBookings,
      (SELECT COUNT(*) FROM Bookings WHERE status = 'APPROVED' AND is_allocated = 0) AS waitingQueue,
      (SELECT COUNT(*) FROM Bookings WHERE status = 'CANCELLED') AS cancelledBookings,
      (SELECT COUNT(*) FROM Venues WHERE is_active = 1) AS activeVenues
  `);

  const row = result.recordset[0];
  return {
    totalRequests: row?.totalRequests ?? 0,
    pendingApprovals: row?.pendingApprovals ?? 0,
    allocatedBookings: row?.allocatedBookings ?? 0,
    waitingQueue: row?.waitingQueue ?? 0,
    activeVenues: row?.activeVenues ?? 0,
    cancelledBookings: row?.cancelledBookings ?? 0,
  };
}
