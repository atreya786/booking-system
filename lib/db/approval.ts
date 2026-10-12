import sql from "mssql";
import connectDB from "../db";
import { updateVenueAllocation } from "../utils/allocation";

export interface ApprovalData {
  appointment_id: number;
  role: string;
  action: "APPROVED" | "REJECTED";
  remarks?: string;
}

export async function updateApprovalStatus(data: ApprovalData) {
  const pool = await connectDB();

  if (!pool) {
    throw new Error("Database connection failed");
  }

  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    // 1. Fetch booking with lock
    const req = new sql.Request(transaction);
    req.input("id", sql.Int, data.appointment_id);

    const result = await req.query(`
      SELECT *
      FROM Bookings WITH (UPDLOCK, ROWLOCK)
      WHERE appointment_id = @id
    `);

    const booking = result.recordset[0];

    if (!booking) {
      throw new Error("Booking not found");
    }

    // 2. Prevent changes on finalized bookings
    if (booking.status === "REJECTED" || booking.status === "CANCELLED") {
      throw new Error(`This booking is already finalized (${booking.status})`);
    }

    const remarks = data.remarks?.trim() || null;

    // 3. GUIDE APPROVAL
    if (data.role === "GUIDE") {
      if (booking.guide_status !== "PENDING") {
        throw new Error("Guide approval has already been completed");
      }

      const updateReq = new sql.Request(transaction);
      updateReq.input("id", sql.Int, data.appointment_id);
      updateReq.input("action", sql.NVarChar(20), data.action);
      updateReq.input(
        "newStatus",
        sql.NVarChar(30),
        data.action === "REJECTED" ? "REJECTED" : "PENDING",
      );
      updateReq.input("remarks", sql.NVarChar(500), remarks);

      await updateReq.query(`
        UPDATE Bookings
        SET
          guide_status = @action,
          status = @newStatus,
          rejection_reason = COALESCE(@remarks, rejection_reason),
          updated_at = GETDATE()
        WHERE appointment_id = @id
      `);

      await transaction.commit();
      return;
    }

    // 4. HOD APPROVAL
    if (data.role === "HOD") {
      if (booking.guide_status !== "APPROVED") {
        throw new Error(
          "Guide approval is required before HOD can take action",
        );
      }

      if (booking.hod_status !== "PENDING") {
        throw new Error("HOD approval has already been completed");
      }

      const updateReq = new sql.Request(transaction);
      updateReq.input("id", sql.Int, data.appointment_id);
      updateReq.input("action", sql.NVarChar(20), data.action);
      updateReq.input(
        "newStatus",
        sql.NVarChar(30),
        data.action === "REJECTED" ? "REJECTED" : "PENDING",
      );
      updateReq.input("remarks", sql.NVarChar(500), remarks);

      await updateReq.query(`
        UPDATE Bookings
        SET
          hod_status = @action,
          status = @newStatus,
          rejection_reason = COALESCE(@remarks, rejection_reason),
          updated_at = GETDATE()
        WHERE appointment_id = @id
      `);

      await transaction.commit();
      return;
    }

    // 5. ADMIN APPROVAL
    if (data.role === "ADMIN") {
      if (booking.hod_status !== "APPROVED") {
        throw new Error("HOD approval is required before Admin can finalize");
      }

      if (booking.admin_status !== "PENDING") {
        throw new Error("Admin approval has already been completed");
      }

      if (data.action === "REJECTED") {
        const rejectReq = new sql.Request(transaction);
        rejectReq.input("id", sql.Int, data.appointment_id);
        rejectReq.input("remarks", sql.NVarChar(500), remarks);

        await rejectReq.query(`
          UPDATE Bookings
          SET
            admin_status = 'REJECTED',
            status = 'REJECTED',
            rejection_reason = COALESCE(@remarks, rejection_reason),
            updated_at = GETDATE()
          WHERE appointment_id = @id
        `);

        await transaction.commit();
        return;
      }

      // ADMIN APPROVES
      const approveReq = new sql.Request(transaction);
      approveReq.input("id", sql.Int, data.appointment_id);
      approveReq.input("remarks", sql.NVarChar(500), remarks);

      await approveReq.query(`
        UPDATE Bookings
        SET
          admin_status = 'APPROVED',
          status = 'APPROVED',
          rejection_reason = COALESCE(@remarks, rejection_reason),
          updated_at = GETDATE()
        WHERE appointment_id = @id
      `);

      // RUN ALLOCATION ENGINE within same transaction context
      await updateVenueAllocation(
        booking.venue_id,
        booking.booking_date,
        transaction,
      );

      await transaction.commit();
      return;
    }

    throw new Error(`Role ${data.role} does not have approval authority`);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
