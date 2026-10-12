import { notFound } from "next/navigation";
import { getBookingById } from "@/lib/db/bookings";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { cancelBookingAction } from "@/actions/bookings";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BookingDetailsPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const booking = await getBookingById(Number(id));

  if (!booking) {
    notFound();
  }

  const isOwner = session?.user.id === String(booking.requested_by);
  const isAdmin = session?.user.role === "ADMIN";
  const canManage = isOwner || isAdmin;
  const isFinalized =
    booking.status === "CANCELLED" || booking.status === "REJECTED";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/bookings"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition mb-2 inline-block"
          >
            ← Back to All Bookings
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            {booking.purpose}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Booking Request ID: #{booking.appointment_id} • Created{" "}
            {new Date(booking.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Action Buttons */}
        {canManage && !isFinalized && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {booking.status === "PENDING" && (
              <Link
                href={`/bookings/${booking.appointment_id}/edit`}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-white/10"
              >
                Edit Request
              </Link>
            )}

            <form action={cancelBookingAction}>
              <input
                type="hidden"
                name="appointment_id"
                value={booking.appointment_id}
              />
              <button
                type="submit"
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500 hover:text-white cursor-pointer"
              >
                Cancel Booking
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Rejection / Cancellation Notice if applicable */}
      {booking.status === "REJECTED" && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-red-400 font-bold text-lg">✕</span>
            <div>
              <p className="font-semibold text-red-300">Request Rejected</p>
              <p className="mt-1 text-zinc-300 text-xs leading-relaxed">
                {booking.rejection_reason
                  ? `Reason / Remarks: "${booking.rejection_reason}"`
                  : "This booking request was rejected during the sequential approval review."}
              </p>
            </div>
          </div>
        </div>
      )}

      {booking.status === "CANCELLED" && (
        <div className="rounded-2xl border border-zinc-500/30 bg-zinc-500/10 p-5 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-zinc-400 font-bold text-lg">⊘</span>
            <div>
              <p className="font-semibold text-zinc-300">Request Cancelled</p>
              <p className="mt-1 text-zinc-400 text-xs">
                This booking has been cancelled. Any reserved venue allocations have been automatically re-evaluated and reassigned.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Details Card */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-xl space-y-8">
        {/* Core Attributes Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Venue</p>
            <p className="mt-1 text-base font-bold text-white">{booking.venue_name}</p>
            {booking.location && (
              <p className="text-xs text-zinc-400">{booking.location}</p>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Reservation Date</p>
            <p className="mt-1 text-base font-bold text-white">
              {new Date(booking.booking_date).toLocaleDateString(undefined, {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
            <p className="text-xs text-indigo-400">Full-Day Allocation</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Requested By</p>
            <p className="mt-1 text-base font-bold text-white">{booking.requested_by_name}</p>
            <p className="text-xs font-mono text-zinc-400">{booking.requested_by_role}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Workflow Status</p>
            <div className="mt-1">
              <StatusBadge status={booking.status} />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Allocation State</p>
            <div className="mt-1">
              {booking.status === "APPROVED" && booking.is_allocated ? (
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
                  CONFIRMED ALLOCATED
                </span>
              ) : booking.status === "APPROVED" && !booking.is_allocated ? (
                <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-400">
                  IN WAITING QUEUE
                </span>
              ) : (
                <span className="text-xs text-zinc-500 font-mono">Pending final approval</span>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Created Timestamp</p>
            <p className="mt-1 text-xs font-mono text-zinc-300">
              {new Date(booking.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Description Section */}
        {booking.description && (
          <div className="border-t border-[var(--border)] pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Description &amp; Event Details
            </p>
            <div className="rounded-2xl border border-white/5 bg-black/20 p-4 text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
              {booking.description}
            </div>
          </div>
        )}

        {/* Sequential Approval Stages */}
        <div className="border-t border-[var(--border)] pt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">
            Approval Workflow Progress (Guide → HOD → Admin)
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <StageCard
              stage="Stage 1"
              title="Guide Approval"
              status={booking.guide_status}
              desc="Faculty / Guide verification"
            />
            <StageCard
              stage="Stage 2"
              title="HOD Approval"
              status={booking.hod_status}
              desc="Department Head authorization"
            />
            <StageCard
              stage="Stage 3"
              title="Admin Finalization"
              status={booking.admin_status}
              desc="Platform Admin allocation"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StageCard({
  stage,
  title,
  status,
  desc,
}: {
  stage: string;
  title: string;
  status: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-zinc-400">{stage}</span>
        <StageBadge status={status} />
      </div>
      <p className="text-sm font-bold text-white">{title}</p>
      <p className="text-xs text-zinc-400">{desc}</p>
    </div>
  );
}

function StageBadge({ status }: { status: string }) {
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

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED") {
    return (
      <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
        APPROVED
      </span>
    );
  }
  if (status === "REJECTED") {
    return (
      <span className="rounded-full bg-red-500/15 border border-red-500/30 px-3 py-1 text-xs font-semibold text-red-400">
        REJECTED
      </span>
    );
  }
  if (status === "CANCELLED") {
    return (
      <span className="rounded-full bg-zinc-500/15 border border-zinc-500/30 px-3 py-1 text-xs font-semibold text-zinc-400">
        CANCELLED
      </span>
    );
  }
  return (
    <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-400">
      PENDING
    </span>
  );
}
