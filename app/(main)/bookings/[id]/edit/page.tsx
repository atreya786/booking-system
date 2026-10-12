import { notFound, redirect } from "next/navigation";
import { getBookingById } from "@/lib/db/bookings";
import { getActiveVenues } from "@/lib/db/venue";
import { updateBookingAction } from "@/actions/bookings";
import { auth } from "@/lib/auth";
import Link from "next/link";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditBookingPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const [booking, venues] = await Promise.all([
    getBookingById(Number(id)),
    getActiveVenues(),
  ]);

  if (!booking) {
    notFound();
  }

  const isOwner = session.user.id === String(booking.requested_by);
  const isAdmin = session.user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    redirect(`/bookings/${id}`);
  }

  if (booking.status !== "PENDING") {
    redirect(`/bookings/${id}`);
  }

  const dateValue = new Date(booking.booking_date).toISOString().split("T")[0];
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href={`/bookings/${id}`}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition mb-2 inline-block"
        >
          ← Back to Booking Details
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Edit Booking Request #{booking.appointment_id}
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Modify venue, date, or event details before final approval.
        </p>
      </div>

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-xl">
        <form action={updateBookingAction} className="space-y-6">
          <input
            type="hidden"
            name="appointment_id"
            value={booking.appointment_id}
          />

          {/* Venue Selection */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Select Venue <span className="text-indigo-400">*</span>
            </label>

            <select
              name="venue_id"
              required
              defaultValue={booking.venue_id}
              className="w-full rounded-xl border border-[var(--border)] bg-black/25 p-3.5 text-sm text-zinc-100 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {venues.map((venue) => (
                <option
                  key={venue.venue_id}
                  value={venue.venue_id}
                  className="bg-zinc-900 text-zinc-100"
                >
                  {venue.venue_name} — {venue.location} (Capacity: {venue.capacity} • {venue.venue_type})
                </option>
              ))}
            </select>
          </div>

          {/* Booking Date */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Booking Date <span className="text-indigo-400">*</span>
            </label>

            <input
              type="date"
              name="booking_date"
              defaultValue={dateValue}
              required
              min={todayStr}
              className="w-full rounded-xl border border-[var(--border)] bg-black/25 p-3.5 text-sm text-zinc-100 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 [color-scheme:dark]"
            />
          </div>

          {/* Purpose */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Event Purpose / Title <span className="text-indigo-400">*</span>
            </label>

            <input
              type="text"
              name="purpose"
              defaultValue={booking.purpose}
              required
              className="w-full rounded-xl border border-[var(--border)] bg-black/25 p-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Description &amp; Requirements
            </label>

            <textarea
              name="description"
              rows={4}
              defaultValue={booking.description || ""}
              className="w-full rounded-xl border border-[var(--border)] bg-black/25 p-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Notice */}
          <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/10 p-4 text-xs text-indigo-200">
            Modifying the venue or date will validate against active venues, blocked dates, and duplicate requests.
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href={`/bookings/${id}`}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/10"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
