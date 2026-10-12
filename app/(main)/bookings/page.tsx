import Link from "next/link";
import { getBookings, getBookingsByUserId } from "@/lib/db/bookings";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Booking } from "@/types/booking";

export default async function BookingsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";
  const bookings: Booking[] = isAdmin
    ? await getBookings()
    : await getBookingsByUserId(Number(session.user.id));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Booking Requests
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {isAdmin
              ? "All venue booking requests across the organization."
              : "Your submitted venue booking requests and their current status."}
          </p>
        </div>

        <Link
          href="/bookings/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500 hover:scale-[1.02] self-start sm:self-auto"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          New Booking Request
        </Link>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xl">
        {bookings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white">No bookings found</h3>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto">
              You haven&apos;t created any booking requests yet. Submit a request to book a venue for a full day.
            </p>
            <div className="pt-2">
              <Link
                href="/bookings/create"
                className="inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition"
              >
                Create First Request
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-[var(--border)] bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Purpose</th>
                  <th className="px-6 py-4">Venue</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Requester</th>
                  <th className="px-6 py-4">Allocation</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--border)] text-sm">
                {bookings.map((booking: Booking, index: number) => (
                  <tr
                    key={booking.appointment_id}
                    className="transition hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-4 text-xs font-mono text-zinc-500">
                      {index + 1}
                    </td>

                    <td className="px-6 py-4">
                      <Link
                        href={`/bookings/${booking.appointment_id}`}
                        className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
                      >
                        {booking.purpose}
                      </Link>
                      {booking.description && (
                        <p className="mt-0.5 text-xs text-zinc-400 line-clamp-1 max-w-xs">
                          {booking.description}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4 text-zinc-300 font-medium">
                      {booking.venue_name}
                    </td>

                    <td className="px-6 py-4 text-zinc-300 whitespace-nowrap">
                      {new Date(booking.booking_date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-zinc-200">
                          {booking.requested_by_name}
                        </p>
                        <p className="text-xs text-zinc-500 font-mono">
                          {booking.requested_by_role}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.status === "APPROVED" && booking.is_allocated ? (
                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                          ALLOCATED
                        </span>
                      ) : booking.status === "APPROVED" && !booking.is_allocated ? (
                        <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                          WAITING QUEUE
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={booking.status} />
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/bookings/${booking.appointment_id}`}
                        className="inline-flex rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED") {
    return (
      <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
        APPROVED
      </span>
    );
  }
  if (status === "REJECTED") {
    return (
      <span className="rounded-full bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 text-xs font-semibold text-red-400">
        REJECTED
      </span>
    );
  }
  if (status === "CANCELLED") {
    return (
      <span className="rounded-full bg-zinc-500/15 border border-zinc-500/30 px-2.5 py-0.5 text-xs font-semibold text-zinc-400">
        CANCELLED
      </span>
    );
  }
  return (
    <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
      PENDING
    </span>
  );
}
