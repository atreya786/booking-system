import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getBookings } from "@/lib/db/bookings";
import { approveBooking, rejectBooking } from "@/actions/approval";
import { Booking } from "@/types/booking";
import Link from "next/link";

export default async function ApprovalsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const role = session.user.role || "";
  const isApprover = role === "GUIDE" || role === "HOD" || role === "ADMIN";

  // Approvers view all bookings so they can inspect requests pending their tier
  const allBookings: Booking[] = await getBookings();

  // Filter items specifically awaiting THIS user's action:
  const pendingMyAction = allBookings.filter((b) => {
    if (role === "GUIDE") {
      return b.status === "PENDING" && b.guide_status === "PENDING";
    }
    if (role === "HOD") {
      return (
        b.status === "PENDING" &&
        b.guide_status === "APPROVED" &&
        b.hod_status === "PENDING"
      );
    }
    if (role === "ADMIN") {
      return (
        b.status === "PENDING" &&
        b.guide_status === "APPROVED" &&
        b.hod_status === "APPROVED" &&
        b.admin_status === "PENDING"
      );
    }
    return false;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Approval Management
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Enforcing the mandatory sequential approval workflow:{" "}
            <span className="font-semibold text-emerald-400">Guide</span> →{" "}
            <span className="font-semibold text-cyan-400">HOD</span> →{" "}
            <span className="font-semibold text-indigo-400">Admin</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Reviewing as:</span>
          <span className="rounded-lg border border-indigo-500/30 bg-indigo-500/15 px-3 py-1 text-xs font-bold uppercase text-indigo-300">
            {role}
          </span>
        </div>
      </div>

      {!isApprover && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-200">
          <p className="font-semibold">Review Privileges Required</p>
          <p className="mt-1 text-xs text-zinc-300">
            Your current account role ({role}) does not have approval privileges in the sequential chain.
            To test approvals, sign in using an account with Guide, HOD, or Admin credentials.
          </p>
        </div>
      )}

      {/* SECTION 1: Action Required */}
      {isApprover && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Action Required ({pendingMyAction.length})
                {pendingMyAction.length > 0 && (
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </h2>
              <p className="text-xs text-zinc-400">
                Requests currently awaiting your {role} review
              </p>
            </div>
          </div>

          {pendingMyAction.length === 0 ? (
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-zinc-400 text-sm">
              <span className="text-2xl block mb-2">✓</span>
              You have no pending approvals in your queue right now. All requests at your stage have been addressed.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingMyAction.map((booking) => (
                <div
                  key={booking.appointment_id}
                  className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/20 via-[var(--card)] to-[var(--card)] p-6 shadow-xl"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-2 max-w-xl">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/bookings/${booking.appointment_id}`}
                          className="text-lg font-bold text-indigo-400 hover:underline"
                        >
                          {booking.purpose}
                        </Link>
                        <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-mono text-zinc-300">
                          #{booking.appointment_id}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-zinc-300">
                        <span>
                          <strong className="text-zinc-400">Venue:</strong> {booking.venue_name}
                        </span>
                        <span>
                          <strong className="text-zinc-400">Date:</strong>{" "}
                          {new Date(booking.booking_date).toLocaleDateString()}
                        </span>
                        <span>
                          <strong className="text-zinc-400">Requester:</strong>{" "}
                          {booking.requested_by_name} ({booking.requested_by_role})
                        </span>
                      </div>

                      {booking.description && (
                        <p className="text-xs text-zinc-400 line-clamp-2">
                          {booking.description}
                        </p>
                      )}
                    </div>

                    {/* Action Form */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:shrink-0">
                      {/* Approve Button */}
                      <form
                        action={async () => {
                          "use server";
                          await approveBooking(booking.appointment_id);
                        }}
                      >
                        <button
                          type="submit"
                          className="w-full sm:w-auto rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-500 cursor-pointer"
                        >
                          ✓ Approve as {role}
                        </button>
                      </form>

                      {/* Reject Form with Remarks */}
                      <form
                        action={async (formData: FormData) => {
                          "use server";
                          const remarks = formData.get("remarks") as string;
                          await rejectBooking(booking.appointment_id, remarks);
                        }}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          name="remarks"
                          placeholder="Rejection reason..."
                          className="rounded-xl border border-[var(--border)] bg-black/30 px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-red-500 w-44"
                        />
                        <button
                          type="submit"
                          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500 hover:text-white cursor-pointer"
                        >
                          ✕ Reject
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: All Approvals Overview */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white">Full Approval Chain Overview</h2>
          <p className="text-xs text-zinc-400">
            Real-time status of all booking requests across Guide, HOD, and Admin tiers
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--border)] bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Purpose</th>
                  <th className="px-6 py-4">Venue</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Requester</th>
                  <th className="px-6 py-4 text-center">Guide</th>
                  <th className="px-6 py-4 text-center">HOD</th>
                  <th className="px-6 py-4 text-center">Admin</th>
                  <th className="px-6 py-4">Allocation</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--border)] text-sm">
                {allBookings.map((b: Booking, index: number) => (
                  <tr key={b.appointment_id} className="hover:bg-white/[0.02] transition">
                    <td className="px-6 py-4 text-xs font-mono text-zinc-500">
                      {index + 1}
                    </td>

                    <td className="px-6 py-4">
                      <Link
                        href={`/bookings/${b.appointment_id}`}
                        className="font-semibold text-indigo-400 hover:underline"
                      >
                        {b.purpose}
                      </Link>
                    </td>

                    <td className="px-6 py-4 text-zinc-300">{b.venue_name}</td>

                    <td className="px-6 py-4 text-zinc-300 whitespace-nowrap">
                      {new Date(b.booking_date).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-zinc-200">{b.requested_by_name}</span>
                      <span className="ml-1 text-xs text-zinc-500">({b.requested_by_role})</span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <Badge status={b.guide_status} />
                    </td>

                    <td className="px-6 py-4 text-center">
                      <Badge status={b.hod_status} />
                    </td>

                    <td className="px-6 py-4 text-center">
                      <Badge status={b.admin_status} />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {b.status === "APPROVED" && b.is_allocated ? (
                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                          ALLOCATED
                        </span>
                      ) : b.status === "APPROVED" && !b.is_allocated ? (
                        <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                          WAITING
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  if (status === "APPROVED") {
    return (
      <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
        APPROVED
      </span>
    );
  }
  if (status === "REJECTED") {
    return (
      <span className="rounded-md bg-red-500/15 border border-red-500/30 px-2 py-0.5 text-[10px] font-semibold text-red-400">
        REJECTED
      </span>
    );
  }
  return (
    <span className="rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
      PENDING
    </span>
  );
}
