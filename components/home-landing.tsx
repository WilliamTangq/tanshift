"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session-context";

type StaffOption = {
  id: string;
  name: string;
  department: string;
};

export function HomeLanding() {
  const router = useRouter();
  const { signInManager, signInStaff, hydrated } = useSession();
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  const [staffId, setStaffId] = useState("");
  const [loadingStaff, setLoadingStaff] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("staff_profiles")
        .select("id, name, department")
        .eq("active", true)
        .order("name", { ascending: true });

      if (!error && data) {
        setStaffOptions(data as StaffOption[]);
      }
      setLoadingStaff(false);
    }
    load();
  }, []);

  function handleManager() {
    signInManager();
    router.push("/manager");
  }

  function handleStaff() {
    const picked = staffOptions.find((s) => s.id === staffId);
    if (!picked) return;
    signInStaff(picked.id, picked.name);
    router.push("/staff");
  }

  return (
    <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
      <div className="max-w-3xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          TanShift
        </p>

        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Mobile-first staff scheduling for small business teams
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          TanShift helps managers collect staff availability, build weekly rosters,
          track hours, and manage shift changes in one simple place.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Manager</h2>
          <p className="mt-2 text-sm text-slate-600">
            Full access to stores, staff, schedules, availability, requests, and
            hours.
          </p>
          <button
            type="button"
            disabled={!hydrated}
            onClick={handleManager}
            className="mt-6 w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
          >
            Continue as manager
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Staff</h2>
          <p className="mt-2 text-sm text-slate-600">
            Sign in as yourself to see only your schedule, availability, and
            requests.
          </p>
          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Who are you?
            </label>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              disabled={loadingStaff}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[var(--ts-accent)]"
            >
              <option value="">
                {loadingStaff ? "Loading team…" : "Select your name"}
              </option>
              {staffOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.department}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            disabled={!hydrated || !staffId}
            onClick={handleStaff}
            className="mt-4 w-full rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Continue as staff
          </button>
          <p className="mt-3 text-xs text-slate-500">
            In production, this step is replaced by your real sign-in (email or
            SSO). Here we bind the browser session to a staff profile.
          </p>
        </div>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Weekly availability",
            body: "Staff submit next week’s availability before the deadline.",
          },
          {
            title: "Simple roster planning",
            body: "Managers assign front and kitchen shifts with fewer mistakes.",
          },
          {
            title: "All-rounder coverage",
            body: "Keep each department covered with the right skill mix.",
          },
          {
            title: "Hours tracking",
            body: "See each staff member’s weekly scheduled hours at a glance.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-slate-900">{card.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{card.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
