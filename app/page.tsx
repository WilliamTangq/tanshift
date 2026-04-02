export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            TanShift
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Mobile-first staff scheduling for small business teams
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            TanShift helps managers collect staff availability, build weekly
            rosters, track hours, and manage shift changes in one simple place.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90">
              Manager Login
            </button>
            <button className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
              Staff Login
            </button>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Weekly availability
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Staff submit next week’s availability before the deadline.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Simple roster planning
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Managers assign front and kitchen shifts with fewer mistakes.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              All-rounder coverage
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Make sure each department has at least one all-rounder on shift.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Hours tracking
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              See each staff member’s weekly scheduled hours at a glance.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}