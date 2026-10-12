import { getVenues } from "@/lib/db/venue";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { deactivateVenue, activateVenue } from "@/actions/venue";
import { Venue } from "@/types/venue";

export default async function VenuesPage() {
  const venues: Venue[] = await getVenues();
  const session = await auth();
  const isAdmin = session?.user.role === "ADMIN";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Venues Directory
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage active conference halls, seminar rooms, and auditoriums.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/bookings/create"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-zinc-200 transition hover:bg-white/10"
          >
            Create Booking
          </Link>

          {isAdmin && (
            <Link
              href="/venues/create"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500"
            >
              <span>+</span>
              <span>Add Venue</span>
            </Link>
          )}
        </div>
      </div>

      {/* Venues Table Container */}
      <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xl">
        {venues.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <h3 className="text-base font-semibold text-white">No venues configured</h3>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto">
              No venues have been registered in the database yet.
            </p>
            {isAdmin && (
              <div className="pt-2">
                <Link
                  href="/venues/create"
                  className="inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition"
                >
                  Create First Venue
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--border)] bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Venue Name</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Capacity</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  {isAdmin && <th className="px-6 py-4 text-right">Admin Controls</th>}
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--border)]">
                {venues.map((venue: Venue) => (
                  <tr key={venue.venue_id} className="hover:bg-white/[0.02] transition">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-500">
                      #{venue.venue_id}
                    </td>

                    <td className="px-6 py-4">
                      <Link
                        href={`/venues/${venue.venue_id}`}
                        className="font-semibold text-indigo-400 hover:underline"
                      >
                        {venue.venue_name}
                      </Link>
                    </td>

                    <td className="px-6 py-4 text-zinc-300">{venue.location}</td>

                    <td className="px-6 py-4 text-zinc-300 font-mono">
                      {venue.capacity} seats
                    </td>

                    <td className="px-6 py-4 text-zinc-400">
                      <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs">
                        {venue.venue_type || "Standard"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {venue.is_active ? (
                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 text-xs font-semibold text-red-400">
                          INACTIVE
                        </span>
                      )}
                    </td>

                    {isAdmin && (
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/venues/${venue.venue_id}/edit`}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/10"
                          >
                            Edit
                          </Link>

                          {venue.is_active ? (
                            <form
                              action={deactivateVenue.bind(
                                null,
                                venue.venue_id.toString(),
                              )}
                            >
                              <button
                                type="submit"
                                className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500 hover:text-white cursor-pointer"
                              >
                                Deactivate
                              </button>
                            </form>
                          ) : (
                            <form
                              action={activateVenue.bind(
                                null,
                                venue.venue_id.toString(),
                              )}
                            >
                              <button
                                type="submit"
                                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500 hover:text-white cursor-pointer"
                              >
                                Activate
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    )}
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
