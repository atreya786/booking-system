"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { updateApprovalStatus } from "@/lib/db/approval";

export async function approveBooking(
  appointment_id: number,
  remarks?: string,
) {
  const session = await auth();

  if (!session || !session.user.role) {
    throw new Error("Unauthorized");
  }

  const role = session.user.role;
  if (role !== "GUIDE" && role !== "HOD" && role !== "ADMIN") {
    throw new Error("You do not have approval privileges");
  }

  await updateApprovalStatus({
    appointment_id,
    role,
    action: "APPROVED",
    remarks,
  });

  revalidatePath("/");
  revalidatePath("/approvals");
  revalidatePath(`/bookings/${appointment_id}`);
  revalidatePath("/bookings");
  revalidatePath("/queue");
}

export async function rejectBooking(
  appointment_id: number,
  remarks?: string,
) {
  const session = await auth();

  if (!session || !session.user.role) {
    throw new Error("Unauthorized");
  }

  const role = session.user.role;
  if (role !== "GUIDE" && role !== "HOD" && role !== "ADMIN") {
    throw new Error("You do not have approval privileges");
  }

  await updateApprovalStatus({
    appointment_id,
    role,
    action: "REJECTED",
    remarks,
  });

  revalidatePath("/");
  revalidatePath("/approvals");
  revalidatePath(`/bookings/${appointment_id}`);
  revalidatePath("/bookings");
  revalidatePath("/queue");
}
