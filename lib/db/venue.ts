import sql from "mssql";
import connectDB from "@/lib/db";
import { Venue } from "@/types/venue";

export async function getVenues(): Promise<Venue[]> {
  try {
    const pool = await connectDB();

    if (pool) {
      const result = await pool.request().query<Venue>(`
        SELECT *
        FROM Venues
        ORDER BY venue_id ASC
      `);

      return result.recordset || [];
    }
    return [];
  } catch (error) {
    console.error("Get Venues Error:", error);
    throw new Error("Failed to fetch venues");
  }
}

export async function getActiveVenues(): Promise<Venue[]> {
  try {
    const pool = await connectDB();

    if (pool) {
      const result = await pool.request().query<Venue>(`
        SELECT *
        FROM Venues
        WHERE is_active = 1
        ORDER BY venue_name ASC
      `);

      return result.recordset || [];
    }
    return [];
  } catch (error) {
    console.error("Get Active Venues Error:", error);
    throw new Error("Failed to fetch active venues");
  }
}

export async function getVenueById(id: number): Promise<Venue | null> {
  try {
    const pool = await connectDB();

    if (pool) {
      const result = await pool.request().input("id", sql.Int, id).query<Venue>(`
        SELECT *
        FROM Venues
        WHERE venue_id = @id
      `);

      return result.recordset[0] || null;
    }
    return null;
  } catch (error) {
    console.error("Get Venue Error:", error);
    throw new Error("Failed to fetch venue");
  }
}
