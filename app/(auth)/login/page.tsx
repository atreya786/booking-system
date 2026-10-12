import { loginAction } from "@/actions/auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 shadow-xl shadow-indigo-600/30">
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
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Venue<span className="text-indigo-400">Flow</span>
          </h1>
          <p className="text-sm text-zinc-400">
            Venue Booking & Full-Day Priority Allocation Platform
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl backdrop-blur-sm space-y-5">
          <form action={loginAction} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="e.g. admin@test.com"
                required
                className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-3.5 text-sm text-[var(--foreground)] placeholder:text-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-3.5 text-sm text-[var(--foreground)] placeholder:text-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 transition shadow-lg shadow-indigo-600/30 cursor-pointer text-sm"
            >
              Sign In to Dashboard
            </button>
          </form>

          {/* Portfolio Demo Credentials Helper */}
          <div className="pt-4 border-t border-[var(--border)] space-y-2.5">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider text-center">
              Demo Access Roles (Password: 123456)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-2 text-zinc-300">
                <span className="font-semibold text-indigo-400 block">ADMIN (Priority 1)</span>
                admin@test.com
              </div>
              <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-2 text-zinc-300">
                <span className="font-semibold text-cyan-400 block">HOD (Priority 2)</span>
                hod@test.com
              </div>
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 text-zinc-300">
                <span className="font-semibold text-emerald-400 block">GUIDE (Priority 3)</span>
                faculty@test.com
              </div>
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-2 text-zinc-300">
                <span className="font-semibold text-amber-400 block">STUDENT (Priority 5)</span>
                student@test.com
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
