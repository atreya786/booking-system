"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createBooking,
  updateBooking,
  cancelBooking,
} from "@/lib/db/bookings";

export async function createBookingAction(formData: FormData) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const venue_id = Number(formData.get("venue_id"));
  const booking_date = String(formData.get("booking_date")).trim();
  const purpose = String(formData.get("purpose")).trim();
  const description = String(formData.get("description") || "").trim();

  if (!venue_id || !booking_date || !purpose) {
    throw new Error("Venue, booking date, and purpose are required fields.");
  }

  await createBooking({
    venue_id,
    requested_by: Number(session.user.id),
    booking_date,
    purpose,
    description,
  });

  revalidatePath("/");
  revalidatePath("/bookings");
  revalidatePath("/approvals");
  revalidatePath("/queue");

  redirect("/bookings");
}

export async function updateBookingAction(formData: FormData) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const appointment_id = Number(formData.get("appointment_id"));
  const venue_id = Number(formData.get("venue_id"));
  const booking_date = String(formData.get("booking_date")).trim();
  const purpose = String(formData.get("purpose")).trim();
  const description = String(formData.get("description") || "").trim();

  if (!appointment_id || !venue_id || !booking_date || !purpose) {
    throw new Error("All required fields must be supplied.");
  }

  await updateBooking(
    {
      appointment_id,
      venue_id,
      booking_date,
      purpose,
      description,
    },
    Number(session.user.id),
    session.user.role === "ADMIN",
  );

  revalidatePath("/");
  revalidatePath("/bookings");
  revalidatePath(`/bookings/${appointment_id}`);
  revalidatePath("/queue");

  redirect(`/bookings/${appointment_id}`);
}

export async function cancelBookingAction(formData: FormData) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const appointment_id = Number(formData.get("appointment_id"));

  if (!appointment_id) {
    throw new Error("Invalid booking ID");
  }

  await cancelBooking(
    appointment_id,
    Number(session.user.id),
    session.user.role === "ADMIN",
  );

  revalidatePath("/");
  revalidatePath("/bookings");
  revalidatePath(`/bookings/${appointment_id}`);
  revalidatePath("/approvals");
  revalidatePath("/queue");

  redirect("/bookings");
}
