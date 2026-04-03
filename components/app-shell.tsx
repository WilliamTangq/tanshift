"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/session-context";

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-[var(--ts-accent-muted)] text-[var(--ts-accent-fg)]"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {label}
    </Link>
  );
}

function MobileNavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-[11px] font-semibold ${
        active
          ? "text-[var(--ts-accent-fg)]"
          : "text-slate-500"
      }`}
    >
      <span
        className={`h-1 w-8 rounded-full ${
          active ? "bg-[var(--ts-accent)]" : "bg-transparent"
        }`}
        aria-hidden
      />
      {label}
    </Link>
  );
}

export function ManagerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useSession();

  const items = [
    { href: "/manager", label: "Dashboard" },
    { href: "/manager/schedule", label: "Schedule" },
    { href: "/manager/availability", label: "Availability" },
    { href: "/manager/staff", label: "Staff" },
    { href: "/manager/requests", label: "Requests" },
    { href: "/manager/hours", label: "Hours" },
  ];

  function handleSignOut() {
    signOut();
    router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--ts-bg)]">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/manager" className="font-semibold tracking-tight text-slate-900">
              TanShift
            </Link>
            <span className="hidden rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-violet-800 sm:inline">
              Manager
            </span>
          </div>
          <nav className="hidden flex-wrap items-center justify-end gap-1 lg:flex">
            {items.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                active={
                  item.href === "/manager"
                    ? pathname === "/manager"
                    : pathname.startsWith(item.href)
                }
              />
            ))}
            <button
              type="button"
              onClick={handleSignOut}
              className="ml-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Sign out
            </button>
          </nav>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 lg:hidden"
          >
            Out
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 pb-24 sm:px-6 lg:pb-8">{children}</main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden"
        aria-label="Primary"
      >
        <div className="mx-auto flex max-w-lg">
          {items.slice(0, 5).map((item) => (
            <MobileNavLink
              key={item.href}
              href={item.href}
              label={item.label.split(" ")[0]}
              active={
                item.href === "/manager"
                  ? pathname === "/manager"
                  : pathname.startsWith(item.href)
              }
            />
          ))}
          <Link
            href="/manager/hours"
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-[11px] font-semibold ${
              pathname.startsWith("/manager/hours")
                ? "text-[var(--ts-accent-fg)]"
                : "text-slate-500"
            }`}
          >
            <span
              className={`h-1 w-8 rounded-full ${
                pathname.startsWith("/manager/hours")
                  ? "bg-[var(--ts-accent)]"
                  : "bg-transparent"
              }`}
              aria-hidden
            />
            Hours
          </Link>
        </div>
      </nav>
    </div>
  );
}

export function StaffShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { staffName, signOut } = useSession();

  const items = [
    { href: "/staff", label: "Home" },
    { href: "/staff/schedule", label: "Schedule" },
    { href: "/staff/availability", label: "Availability" },
    { href: "/staff/requests", label: "Requests" },
  ];

  function handleSignOut() {
    signOut();
    router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--ts-bg)]">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <Link href="/staff" className="font-semibold tracking-tight text-slate-900">
              TanShift
            </Link>
            {staffName && (
              <p className="truncate text-xs text-slate-500">{staffName}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-800 sm:inline">
              Staff
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:text-sm"
            >
              Sign out
            </button>
          </div>
        </div>
        <nav className="mx-auto hidden max-w-6xl flex-wrap gap-1 px-4 pb-3 sm:px-6 md:flex">
          {items.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              active={
                item.href === "/staff"
                  ? pathname === "/staff"
                  : pathname.startsWith(item.href)
              }
            />
          ))}
        </nav>
      </header>

      <main className="flex-1 px-4 py-6 pb-24 sm:px-6 md:pb-8">{children}</main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden"
        aria-label="Primary"
      >
        <div className="mx-auto flex max-w-lg">
          {items.map((item) => (
            <MobileNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              active={
                item.href === "/staff"
                  ? pathname === "/staff"
                  : pathname.startsWith(item.href)
              }
            />
          ))}
        </div>
      </nav>
    </div>
  );
}
