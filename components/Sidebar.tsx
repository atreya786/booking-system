import Link from "next/link";
import { signOut, auth } from "@/lib/auth";

export default async function Sidebar() {
  const session = await auth();
  const role = session?.user.role || "USER";

  const roleBadgeColors: Record<string, string> = {
    ADMIN: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    HOD: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    GUIDE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    STAFF: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    APPRENTICE: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  };

  const badgeClass =
    roleBadgeColors[role] || "bg-zinc-500/15 text-zinc-400 border-zinc-500/30";

  return (
    <aside className="flex min-h-screen w-72 flex-col justify-between border-r border-[var(--border)] bg-[var(--sidebar)] p-6 text-white shrink-0">
      {/* Top Section */}
      <div>
        {/* Logo & Brand */}
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 shadow-lg shadow-indigo-600/30 transition-transform group-hover:scale-105">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-white">
                  Venue<span className="text-indigo-400">Flow</span>
                </span>
              </div>
              <p className="text-xs font-medium text-zinc-400">
                Allocation & Approvals
              </p>
            </div>
          </Link>
        </div>

        {/* User Card */}
        <div className="mb-6 rounded-2xl border border-[var(--border)] bg-white/[0.03] p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-sm font-bold text-indigo-300">
              {session?.user.name ? session.user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-semibold text-zinc-100">
                {session?.user.name || "Authenticated User"}
              </p>
              <p className="truncate text-xs text-zinc-400">
                {session?.user.email || "user@domain.com"}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-xs text-zinc-400">Access Role:</span>
            <span
              className={`rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${badgeClass}`}
            >
              {role}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          <SidebarLink
            href="/"
            label="Dashboard"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            }
          />
          <SidebarLink
            href="/bookings"
            label="Bookings"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            }
          />
          <SidebarLink
            href="/approvals"
            label="Approvals"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <SidebarLink
            href="/queue"
            label="Allocation Queue"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
          />
          <SidebarLink
            href="/venues"
            label="Venues"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />

          <div className="pt-2">
            <Link
              href="/bookings/create"
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-600/40"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Request</span>
            </Link>
          </div>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-4 pt-6 border-t border-white/5">
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/30 p-3 text-xs leading-relaxed text-indigo-300">
          <p className="font-semibold text-indigo-200 mb-0.5">Full-Day Allocation Engine</p>
          Single confirmed booking per venue/date. Role priority resolves queue contention.
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700/60 bg-white/[0.04] py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 cursor-pointer">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.07] hover:text-white"
    >
      <span className="text-zinc-400">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
