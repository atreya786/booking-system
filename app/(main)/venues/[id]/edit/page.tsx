import { getVenueById } from "@/lib/db/venue";
import { updateVenue } from "@/actions/venue";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditVenuePage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/venues");
  }

  const venue = await getVenueById(Number(id));

  if (!venue) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href={`/venues/${id}`}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition mb-2 inline-block"
        >
          ← Back to Venue Details
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Edit Venue #{venue.venue_id}
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Update venue configuration and seating capacity.
        </p>
      </div>

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-xl">
        <form action={updateVenue.bind(null, id)} className="space-y-6">
          {/* Venue Name */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Venue Name <span className="text-indigo-400">*</span>
            </label>
            <input
              type="text"
              name="venue_name"
              defaultValue={venue.venue_name}
              required
              className="w-full rounded-xl border border-[var(--border)] bg-black/25 p-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Location
            </label>
            <input
              type="text"
              name="location"
              defaultValue={venue.location || ""}
              className="w-full rounded-xl border border-[var(--border)] bg-black/25 p-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Capacity */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Capacity
              </label>
              <input
                type="number"
                name="capacity"
                defaultValue={venue.capacity}
                min={1}
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
                defaultValue={venue.venue_type || ""}
                className="w-full rounded-xl border border-[var(--border)] bg-black/25 p-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href={`/venues/${id}`}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/10"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 cursor-pointer"
            >
              Update Venue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
