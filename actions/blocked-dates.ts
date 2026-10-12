"use server";

import { blockDate, unblockDate } from "@/lib/db/blocked-dates";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function blockDateAction(formData: FormData) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const booking_date = String(formData.get("booking_date")).trim();
  const reason = String(formData.get("reason") || "").trim();

  if (!booking_date) {
    throw new Error("Date is required");
  }

  await blockDate(booking_date, reason);

  revalidatePath("/");
  revalidatePath("/bookings");
  revalidatePath("/bookings/create");
}

export async function unblockDateAction(formData: FormData) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const booking_date = String(formData.get("booking_date")).trim();

  if (!booking_date) {
    throw new Error("Date is required");
  }

  await unblockDate(booking_date);

  revalidatePath("/");
  revalidatePath("/bookings");
  revalidatePath("/bookings/create");
}
