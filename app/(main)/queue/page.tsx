import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getVenueQueues } from "@/lib/db/bookings";
import { VenueQueueGroup, Booking } from "@/types/booking";
import Link from "next/link";

export default async function QueuePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const venueQueues: VenueQueueGroup[] = await getVenueQueues();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Allocation Queue Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Real-time view of confirmed venue allocations versus approved requests in waiting contention.
          </p>
        </div>

        <Link
          href="/bookings/create"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500 self-start sm:self-auto"
        >
          + Submit New Request
        </Link>
      </div>

      {venueQueues.length === 0 ? (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-white">No active venue queues</h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            There are currently no approved bookings competing for venue allocations.
            Once bookings complete the Guide → HOD → Admin approval chain, they appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {venueQueues.map((group: VenueQueueGroup) => {
            const { allocated, waiting, venue_name, booking_date } = group;

            return (
              <div
                key={`${group.venue_id}_${booking_date}`}
                className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xl"
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[var(--border)] bg-gradient-to-r from-indigo-950/40 via-white/[0.02] to-transparent px-6 py-4">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      {venue_name}
                      <span className="text-sm font-normal text-zinc-400">
                        • {new Date(booking_date).toLocaleDateString(undefined, {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </h2>
                    <p className="text-xs text-indigo-400">
                      Full-Day Reservation Window
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                      {allocated ? "1 Allocated" : "0 Allocated"}
                    </span>
                    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
                      {waiting.length} Waiting in Queue
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Current Confirmed Allocation */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Confirmed Allocation
                      </h3>
                      {allocated && (
                        <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          AWARDED BY PRIORITY
                        </span>
                      )}
                    </div>

                    {allocated ? (
                      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="space-y-1">
                            <Link
                              href={`/bookings/${allocated.appointment_id}`}
                              className="text-lg font-bold text-emerald-400 hover:underline"
                            >
                              {allocated.purpose}
                            </Link>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-300">
                              <span>
                                <strong className="text-zinc-400">Holder:</strong>{" "}
                                {allocated.requested_by_name}
                              </span>
                              <span>
                                <strong className="text-zinc-400">Role:</strong>{" "}
                                <span className="font-mono text-emerald-300">
                                  {allocated.requested_by_role}
                                </span>
                              </span>
                              <span>
                                <strong className="text-zinc-400">Submitted:</strong>{" "}
                                {new Date(allocated.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <Link
                            href={`/bookings/${allocated.appointment_id}`}
                            className="inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-500 self-start sm:self-auto"
                          >
                            View Booking →
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-[var(--border)] p-5 text-center text-xs text-zinc-400">
                        No active booking is currently allocated for this date.
                      </div>
                    )}
                  </div>

                  {/* Waiting Queue */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                      Approved Requests in Waiting Queue ({waiting.length})
                    </h3>

                    {waiting.length > 0 ? (
                      <div className="space-y-2.5">
                        {waiting.map((req: Booking, idx: number) => (
                          <div
                            key={req.appointment_id}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-[var(--border)] bg-white/[0.02] p-4 transition hover:bg-white/[0.04]"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-400 font-mono shrink-0">
                                #{idx + 1}
                              </div>

                              <div>
                                <Link
                                  href={`/bookings/${req.appointment_id}`}
                                  className="text-sm font-semibold text-zinc-200 hover:text-indigo-400 transition"
                                >
                                  {req.purpose}
                                </Link>

                                <div className="flex flex-wrap items-center gap-x-3 text-xs text-zinc-400">
                                  <span>{req.requested_by_name}</span>
                                  <span>•</span>
                                  <span className="font-mono text-zinc-300">
                                    {req.requested_by_role}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    Requested{" "}
                                    {new Date(req.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                                QUEUED
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-[var(--border)] p-4 text-center text-xs text-zinc-400">
                        No requests waiting in queue for this venue date. If the allocated booking is cancelled, the venue will become immediately free.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
