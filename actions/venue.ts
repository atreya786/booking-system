"use server";

import sql from "mssql";
import connectDB from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createVenue(formData: FormData) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Only administrators can create venues");
  }

  const venue_name = (formData.get("venue_name") as string)?.trim();
  const location = (formData.get("location") as string)?.trim() || "";
  const capacity = Number(formData.get("capacity"));
  const venue_type = (formData.get("venue_type") as string)?.trim() || "Conference Room";

  if (!venue_name || !capacity) {
    throw new Error("Venue name and positive capacity are required");
  }

  try {
    const pool = await connectDB();

    if (pool) {
      await pool
        .request()
        .input("venue_name", sql.VarChar(255), venue_name)
        .input("location", sql.VarChar(255), location)
        .input("capacity", sql.Int, capacity)
        .input("venue_type", sql.VarChar(100), venue_type).query(`
          INSERT INTO Venues (
            venue_name,
            location,
            capacity,
            venue_type,
            is_active,
            created_at
          )
          VALUES (
            @venue_name,
            @location,
            @capacity,
            @venue_type,
            1,
            GETDATE()
          )
        `);
    }
  } catch (error) {
    console.error("Create Venue Error:", error);
    throw new Error("Failed to create venue");
  }

  revalidatePath("/");
  revalidatePath("/venues");
  revalidatePath("/bookings/create");

  redirect("/venues");
}

export async function updateVenue(id: string, formData: FormData) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Only administrators can update venues");
  }

  const venue_name = (formData.get("venue_name") as string)?.trim();
  const location = (formData.get("location") as string)?.trim() || "";
  const capacity = Number(formData.get("capacity"));
  const venue_type = (formData.get("venue_type") as string)?.trim();

  if (!venue_name) {
    throw new Error("Venue name is required");
  }

  try {
    const pool = await connectDB();

    if (pool) {
      const req = pool
        .request()
        .input("id", sql.Int, Number(id))
        .input("venue_name", sql.VarChar(255), venue_name)
        .input("location", sql.VarChar(255), location);

      let updateQuery = `
        UPDATE Venues
        SET
          venue_name = @venue_name,
          location = @location,
          updated_at = GETDATE()
      `;

      if (capacity && !isNaN(capacity)) {
        req.input("capacity", sql.Int, capacity);
        updateQuery += `, capacity = @capacity`;
      }

      if (venue_type) {
        req.input("venue_type", sql.VarChar(100), venue_type);
        updateQuery += `, venue_type = @venue_type`;
      }

      updateQuery += ` WHERE venue_id = @id`;

      await req.query(updateQuery);
    }
  } catch (error) {
    console.error("Update Venue Error:", error);
    throw new Error("Failed to update venue");
  }

  revalidatePath("/");
  revalidatePath("/venues");
  revalidatePath(`/venues/${id}`);

  redirect("/venues");
}

export async function deactivateVenue(venue_id: string) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Only administrators can toggle venue status");
  }

  const id = Number(venue_id);

  try {
    const pool = await connectDB();

    if (pool) {
      await pool.request().input("id", sql.Int, id).query(`
        UPDATE Venues
        SET is_active = 0, updated_at = GETDATE()
        WHERE venue_id = @id
      `);
    }
  } catch (error) {
    console.error("Deactivate Venue Error:", error);
    throw new Error("Failed to deactivate venue");
  }

  revalidatePath("/");
  revalidatePath("/venues");
  revalidatePath(`/venues/${venue_id}`);
}

export async function activateVenue(venue_id: string) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Only administrators can toggle venue status");
  }

  const id = Number(venue_id);

  try {
    const pool = await connectDB();

    if (pool) {
      await pool.request().input("id", sql.Int, id).query(`
        UPDATE Venues
        SET is_active = 1, updated_at = GETDATE()
        WHERE venue_id = @id
      `);
    }
  } catch (error) {
    console.error("Activate Venue Error:", error);
    throw new Error("Failed to activate venue");
  }

  revalidatePath("/");
  revalidatePath("/venues");
  revalidatePath(`/venues/${venue_id}`);
}
