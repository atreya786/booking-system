import sql from "mssql";
import connectDB from "../db";

export async function validateBooking(
  venue_id: number,
  booking_date: string,
  requested_by?: number,
  exclude_appointment_id?: number,
) {
  const pool = await connectDB();

  if (!pool) {
    throw new Error("Database connection failed");
  }

  // CHECK WORKING HOURS (9 AM to 6 PM)
  // Can be bypassed for testing or if environment variable is set
  const bypassHours =
    process.env.BYPASS_OFFICE_HOURS === "true" ||
    process.env.NODE_ENV === "test";

  if (!bypassHours) {
    const now = new Date();
    const currentHour = now.getHours();

    if (currentHour < 9 || currentHour >= 18) {
      throw new Error(
        "Booking requests can only be submitted during working hours (9:00 AM - 6:00 PM)",
      );
    }
  }

  // CHECK PAST DATE
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDate = new Date(booking_date);
  if (isNaN(selectedDate.getTime())) {
    throw new Error("Invalid booking date specified");
  }

  // Normalise selected date to midnight UTC/local
  const selectedDateMidnight = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
  );

  if (selectedDateMidnight < today) {
    throw new Error("Past dates are not allowed for booking requests");
  }

  // CHECK BLOCKED DATE
  const blocked = await pool
    .request()
    .input("booking_date", sql.Date, booking_date).query(`
      SELECT blocked_date, reason
      FROM BlockedDates
      WHERE blocked_date = @booking_date
    `);

  if (blocked.recordset.length > 0) {
    const reason = blocked.recordset[0].reason;
    throw new Error(
      `This date is blocked by admin${reason ? `: ${reason}` : ""}`,
    );
  }

  // CHECK VENUE ACTIVE
  const venue = await pool.request().input("venue_id", sql.Int, venue_id)
    .query(`
      SELECT venue_id, venue_name, is_active
      FROM Venues
      WHERE venue_id = @venue_id
    `);

  if (venue.recordset.length === 0) {
    throw new Error("Venue does not exist");
  }

  if (!venue.recordset[0].is_active) {
    throw new Error(
      `Venue "${venue.recordset[0].venue_name}" is currently inactive`,
    );
  }

  // CHECK DUPLICATE REQUEST BY SAME USER
  if (requested_by) {
    const request = pool
      .request()
      .input("requested_by", sql.Int, requested_by)
      .input("venue_id", sql.Int, venue_id)
      .input("booking_date", sql.Date, booking_date);

    let duplicateQuery = `
      SELECT appointment_id
      FROM Bookings
      WHERE requested_by = @requested_by
        AND venue_id = @venue_id
        AND booking_date = @booking_date
        AND status IN ('PENDING', 'APPROVED')
    `;

    if (exclude_appointment_id) {
      request.input("exclude_id", sql.Int, exclude_appointment_id);
      duplicateQuery += ` AND appointment_id != @exclude_id`;
    }

    const duplicateCheck = await request.query(duplicateQuery);

    if (duplicateCheck.recordset.length > 0) {
      throw new Error(
        "You already have a pending or approved request for this venue on this date.",
      );
    }
  }
}
