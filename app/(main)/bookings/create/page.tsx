import { createBookingAction } from "@/actions/bookings";
import { getActiveVenues } from "@/lib/db/venue";
import Link from "next/link";

export default async function CreateBookingPage() {
  const venues = await getActiveVenues();
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/bookings"
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition mb-2 inline-block"
        >
          ← Back to Bookings
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Create Booking Request
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Submit a venue request for full-day reservation under the role-priority allocation engine.
        </p>
      </div>

      {/* Form Container */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-xl">
        <form action={createBookingAction} className="space-y-6">
          {/* Venue Selection Dropdown */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Select Venue <span className="text-indigo-400">*</span>
            </label>

            {venues.length === 0 ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                No active venues are currently available for booking. Contact an administrator.
              </div>
            ) : (
              <select
                name="venue_id"
                required
                defaultValue=""
                className="w-full rounded-xl border border-[var(--border)] bg-black/25 p-3.5 text-sm text-zinc-100 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="" disabled className="bg-zinc-900 text-zinc-500">
                  Select a venue...
                </option>
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
            )}
            <p className="mt-1.5 text-xs text-zinc-400">
              Only active venues are eligible for reservation requests.
            </p>
          </div>

          {/* Booking Date */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Booking Date <span className="text-indigo-400">*</span>
            </label>

            <input
              type="date"
              name="booking_date"
              required
              min={todayStr}
              className="w-full rounded-xl border border-[var(--border)] bg-black/25 p-3.5 text-sm text-zinc-100 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 [color-scheme:dark]"
            />
            <p className="mt-1.5 text-xs text-zinc-400">
              Full-day reservation. All requests for this date compete under the allocation priority rules.
            </p>
          </div>

          {/* Purpose */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Event Purpose / Title <span className="text-indigo-400">*</span>
            </label>

            <input
              type="text"
              name="purpose"
              required
              placeholder="e.g. Annual Department Technical Symposium"
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
              placeholder="Provide agenda details, guest speaker names, A/V requirements, or expected attendee headcount..."
              className="w-full rounded-xl border border-[var(--border)] bg-black/25 p-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Allocation Disclaimer Card */}
          <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/10 p-4 text-xs leading-relaxed text-indigo-200">
            <div className="flex items-start gap-2.5">
              <span className="text-indigo-400 font-bold text-sm">ℹ</span>
              <div>
                <p className="font-semibold text-white mb-0.5">
                  Full-Day Priority Allocation System Notice
                </p>
                Approval does not guarantee final venue allocation. Multiple approved requests
                may target the same venue and date. Contention is resolved by role priority
                (ADMIN &gt; HOD &gt; GUIDE &gt; APPRENTICE), with earlier requests prioritized within the same tier.
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/bookings"
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/10"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={venues.length === 0}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
            >
              Submit Booking Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
