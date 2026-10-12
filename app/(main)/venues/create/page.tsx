import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createVenue } from "@/actions/venue";
import Link from "next/link";

export default async function CreateVenuePage() {
  const session = await auth();

  // RBAC Protection: only administrators can create venues
  if (!session || session.user.role !== "ADMIN") {
    redirect("/venues");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/venues"
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition mb-2 inline-block"
        >
          ← Back to Venues
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Add New Venue
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Register a new venue into the VenueFlow allocation platform.
        </p>
      </div>

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-xl">
        <form action={createVenue} className="space-y-6">
          {/* Venue Name */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Venue Name <span className="text-indigo-400">*</span>
            </label>
            <input
              type="text"
              name="venue_name"
              placeholder="e.g. Main Auditorium Hall A"
              required
              className="w-full rounded-xl border border-[var(--border)] bg-black/25 p-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Location / Building
            </label>
            <input
              type="text"
              name="location"
              placeholder="e.g. Block B, 2nd Floor, Campus North"
              className="w-full rounded-xl border border-[var(--border)] bg-black/25 p-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Capacity */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Seating Capacity <span className="text-indigo-400">*</span>
              </label>
              <input
                type="number"
                name="capacity"
                placeholder="e.g. 250"
                min={1}
                required
                className="w-full rounded-xl border border-[var(--border)] bg-black/25 p-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Venue Type */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Venue Type
              </label>
              <input
                type="text"
                name="venue_type"
                placeholder="Auditorium / Seminar Hall / Conference Room"
                className="w-full rounded-xl border border-[var(--border)] bg-black/25 p-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/venues"
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/10"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 cursor-pointer"
            >
              Save Venue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
