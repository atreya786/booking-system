import sql from "mssql";
import connectDB from "@/lib/db";
import { ROLE_PRIORITY } from "@/lib/constants/priority";

interface BookingCandidate {
  appointment_id: number;
  role: string;
  created_at: string | Date;
}

/**
 * Re-evaluates and applies venue allocation for a given venue and date.
 * Enforces role-priority (ADMIN > HOD > GUIDE > APPRENTICE) and first-come-first-served
 * within identical roles. Concurrency-safe using MSSQL locks.
 */
export async function updateVenueAllocation(
  venue_id: number,
  booking_date: string,
  existingTransaction?: sql.Transaction,
) {
  const pool = await connectDB();

  if (!pool) {
    throw new Error("Database connection failed");
  }

  const runWithTransaction = async (tx: sql.Transaction) => {
    // 1. Fetch all approved bookings with UPDLOCK + HOLDLOCK to serialize access for this venue & date
    const req = new sql.Request(tx);
    req.input("venue_id", sql.Int, venue_id);
    req.input("booking_date", sql.Date, booking_date);

    const result = await req.query<BookingCandidate>(`
      SELECT
        b.appointment_id,
        b.created_at,
        u.role
      FROM Bookings b WITH (UPDLOCK, HOLDLOCK)
      JOIN Users u
        ON b.requested_by = u.user_id
      WHERE
        b.venue_id = @venue_id
      AND
        b.booking_date = @booking_date
      AND
        b.status = 'APPROVED'
    `);

    const bookings = result.recordset || [];

    // 2. Always reset allocation state for all records on this venue & date first
    const resetReq = new sql.Request(tx);
    resetReq.input("venue_id", sql.Int, venue_id);
    resetReq.input("booking_date", sql.Date, booking_date);

    await resetReq.query(`
      UPDATE Bookings
      SET is_allocated = 0
      WHERE
        venue_id = @venue_id
      AND
        booking_date = @booking_date
    `);

    // 3. If there are no approved requests left, allocation is cleared and we finish
    if (!bookings.length) {
      return null;
    }

    // 4. Sort candidates:
    //    Priority 1: Role Priority (lower number = higher priority: ADMIN=1, HOD=2, GUIDE=3, APPRENTICE=5)
    //    Priority 2: Creation timestamp (earlier date wins)
    bookings.sort((a, b) => {
      const priorityA = ROLE_PRIORITY[a.role] ?? 99;
      const priorityB = ROLE_PRIORITY[b.role] ?? 99;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });

    const winner = bookings[0];

    // 5. Mark the winning booking as allocated
    const allocateReq = new sql.Request(tx);
    allocateReq.input("booking_id", sql.Int, winner.appointment_id);

    await allocateReq.query(`
      UPDATE Bookings
      SET is_allocated = 1
      WHERE appointment_id = @booking_id
    `);

    return winner.appointment_id;
  };

  if (existingTransaction) {
    return await runWithTransaction(existingTransaction);
  }

  // Manage independent transaction
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    const winnerId = await runWithTransaction(transaction);
    await transaction.commit();
    return winnerId;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
