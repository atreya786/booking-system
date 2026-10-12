import Link from "next/link";
import { getDashboardStats, getBookings } from "@/lib/db/bookings";

export default async function HomePage() {
  const [stats, recentBookings] = await Promise.all([
    getDashboardStats(),
    getBookings(),
  ]);

  const recent = recentBookings.slice(0, 5);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-br from-indigo-950/60 via-[var(--card)] to-[var(--card)] p-8 md:p-10 shadow-2xl">
        {/* Glow effects */}
        <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-300">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              VenueFlow Full-Day Engine
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Role-Based Venue Allocation &amp;{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Approval Workflow
              </span>
            </h1>

            <p className="mt-4 text-base text-zinc-300 leading-relaxed">
              Full-day booking model with strict hierarchical approval (Guide → HOD → Admin)
              and automated role-priority contention resolution.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/bookings/create"
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 hover:scale-[1.02]"
              >
                + Create Booking Request
              </Link>

              <Link
                href="/queue"
                className="rounded-xl border border-[var(--border)] bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-200 backdrop-blur-sm transition hover:bg-white/10"
              >
                View Live Allocation Queue
              </Link>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 xl:w-96">
            <DashboardCard
              title="Allocated Venues"
              value={stats.allocatedBookings.toString().padStart(2, "0")}
              accent="emerald"
            />
            <DashboardCard
              title="Waiting Queue"
              value={stats.waitingQueue.toString().padStart(2, "0")}
              accent="amber"
            />
            <DashboardCard
              title="Pending Approvals"
              value={stats.pendingApprovals.toString().padStart(2, "0")}
              accent="indigo"
            />
            <DashboardCard
              title="Active Venues"
              value={stats.activeVenues.toString().padStart(2, "0")}
              accent="cyan"
            />
          </div>
        </div>
      </div>

      {/* Workflow Explainer & Quick Links */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Tiered Workflow Card */}
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Sequential Approval</h2>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
              STRICT SEQUENCE
            </span>
          </div>

          <div className="space-y-3">
            <WorkflowStep level="Step 1" title="Guide Review" status="Sequential" desc="Faculty endorsement required first" />
            <WorkflowStep level="Step 2" title="HOD Review" status="Sequential" desc="Department head sign-off" />
            <WorkflowStep level="Step 3" title="Admin Approval" status="Finalizer" desc="Final authorization & allocation" />
            <WorkflowStep level="Step 4" title="Engine Allocation" status="Automated" desc="Priority re-calculation" />
          </div>
        </div>

        {/* Priority Matrix Card */}
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Priority Matrix</h2>
            <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">
              FULL-DAY
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <span className="font-semibold text-indigo-300">ADMIN</span>
              <span className="text-zinc-400 font-mono">Priority 1 (Highest)</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <span className="font-semibold text-cyan-300">HOD</span>
              <span className="text-zinc-400 font-mono">Priority 2</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <span className="font-semibold text-emerald-300">GUIDE</span>
              <span className="text-zinc-400 font-mono">Priority 3</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <span className="font-semibold text-amber-300">APPRENTICE</span>
              <span className="text-zinc-400 font-mono">Priority 5 (Earliest Request Wins)</span>
            </div>
          </div>

          <p className="mt-4 text-xs text-zinc-400 leading-relaxed border-t border-white/5 pt-3">
            Contention between equal roles is automatically resolved by request submission timestamp.
          </p>
        </div>

        {/* Quick Navigation Card */}
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl">
          <h2 className="mb-5 text-lg font-bold text-white">Platform Navigation</h2>
          <div className="space-y-2.5">
            <QuickAction href="/bookings/create" title="Submit Venue Request" subtitle="Choose venue and date" />
            <QuickAction href="/bookings" title="All Bookings" subtitle="View statuses & allocations" />
            <QuickAction href="/approvals" title="Approvals Workflow" subtitle="Pending sequential actions" />
            <QuickAction href="/queue" title="Allocation Queue" subtitle="Allocated vs waiting requests" />
            <QuickAction href="/venues" title="Venue Directory" subtitle="Active venues & capacities" />
          </div>
        </div>
      </div>

      {/* Recent Bookings Feed */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Recent Booking Activity</h2>
            <p className="text-xs text-zinc-400 mt-1">Live requests from the database</p>
          </div>
          <Link
            href="/bookings"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
          >
            View All ({stats.totalRequests}) →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center text-zinc-500 text-sm">
            No bookings recorded yet. Click &quot;Create Booking Request&quot; above to submit the first request.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--border)] text-xs uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="pb-3 font-semibold">Purpose</th>
                  <th className="pb-3 font-semibold">Venue</th>
                  <th className="pb-3 font-semibold">Booking Date</th>
                  <th className="pb-3 font-semibold">Requester</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Allocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {recent.map((b) => (
                  <tr key={b.appointment_id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 pr-4">
                      <Link
                        href={`/bookings/${b.appointment_id}`}
                        className="font-medium text-indigo-400 hover:underline"
                      >
                        {b.purpose}
                      </Link>
                    </td>
                    <td className="py-3.5 text-zinc-300">{b.venue_name}</td>
                    <td className="py-3.5 text-zinc-300">
                      {new Date(b.booking_date).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 text-zinc-300">
                      <span>{b.requested_by_name}</span>
                      <span className="ml-1.5 text-xs text-zinc-500">({b.requested_by_role})</span>
                    </td>
                    <td className="py-3.5">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-3.5">
                      {b.status === "APPROVED" && b.is_allocated ? (
                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                          ALLOCATED
                        </span>
                      ) : b.status === "APPROVED" && !b.is_allocated ? (
                        <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                          WAITING QUEUE
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
        )}
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  accent,
}: {
  title: string;
  value: string;
  accent: "emerald" | "amber" | "indigo" | "cyan";
}) {
  const styles = {
    emerald: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
    amber: "border-amber-500/20 bg-amber-500/5 text-amber-400",
    indigo: "border-indigo-500/20 bg-indigo-500/5 text-indigo-400",
    cyan: "border-cyan-500/20 bg-cyan-500/5 text-cyan-400",
  };

  return (
    <div className={`rounded-2xl border p-5 backdrop-blur-sm ${styles[accent]}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{title}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function WorkflowStep({
  level,
  title,
  status,
  desc,
}: {
  level: string;
  title: string;
  status: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-zinc-200">
          <span className="text-indigo-400 font-mono mr-1.5">{level}:</span>
          {title}
        </span>
        <span className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
          {status}
        </span>
      </div>
      <p className="mt-1 text-zinc-400">{desc}</p>
    </div>
  );
}

function QuickAction({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 transition hover:bg-white/[0.06] group"
    >
      <div>
        <p className="text-xs font-semibold text-zinc-200 group-hover:text-indigo-400 transition">
          {title}
        </p>
        <p className="text-[11px] text-zinc-400">{subtitle}</p>
      </div>
      <span className="text-zinc-500 group-hover:text-indigo-400 transition text-sm">→</span>
    </Link>
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
