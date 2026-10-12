import { notFound } from "next/navigation";
import { getVenueById } from "@/lib/db/venue";
import Link from "next/link";
import { auth } from "@/lib/auth";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VenueDetailsPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const isAdmin = session?.user.role === "ADMIN";

  const venue = await getVenueById(Number(id));

  if (!venue) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/venues"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition mb-2 inline-block"
          >
            ← Back to Venues
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            {venue.venue_name}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Venue #{venue.venue_id} • {venue.location}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/bookings/create"
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500"
          >
            Request Booking
          </Link>

          {isAdmin && (
            <Link
              href={`/venues/${venue.venue_id}/edit`}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-zinc-300 transition hover:bg-white/10"
            >
              Edit Venue
            </Link>
          )}
        </div>
      </div>

      {/* Details Card */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-xl space-y-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Venue Type</p>
            <p className="mt-1 text-base font-bold text-white">{venue.venue_type || "Standard Venue"}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Capacity</p>
            <p className="mt-1 text-base font-bold text-white font-mono">{venue.capacity} persons</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Status</p>
            <div className="mt-1">
              {venue.is_active ? (
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
                  ACTIVE
                </span>
              ) : (
                <span className="rounded-full bg-red-500/15 border border-red-500/30 px-3 py-1 text-xs font-semibold text-red-400">
                  INACTIVE
                </span>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Location</p>
            <p className="mt-1 text-base font-bold text-white">{venue.location}</p>
          </div>
        </div>

        {/* Allocation Info Card */}
        <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/10 p-5 text-xs leading-relaxed text-indigo-200 space-y-2">
          <p className="font-semibold text-white text-sm">VenueFlow Allocation Rules for this Venue</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-300">
            <li>Single full-day reservation slot per date (no partial timeslots).</li>
            <li>Multiple approved requests can queue for the same date.</li>
            <li>Contention resolved by role tier: Admin &gt; HOD &gt; Guide &gt; Apprentice.</li>
            <li>Immediate automatic reallocation if an allocated booking is cancelled.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
