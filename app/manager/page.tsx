"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Store = {
  id: string;
  name: string;
  open_time: string;
  close_time: string;
};

const cards = [
  {
    href: "/manager/schedule",
    title: "Schedule",
    description: "Build shifts, publish the week, and review hours per person.",
    tone: "accent" as const,
  },
  {
    href: "/manager/availability",
    title: "Availability",
    description: "Review submitted availability for the week you are planning.",
    tone: "muted" as const,
  },
  {
    href: "/manager/staff",
    title: "Staff",
    description: "Add staff, set department, skills, and store assignment.",
    tone: "muted" as const,
  },
  {
    href: "/manager/requests",
    title: "Requests",
    description: "Approve or reject leave and swap requests from your team.",
    tone: "muted" as const,
  },
  {
    href: "/manager/hours",
    title: "Hours",
    description: "Compare scheduled hours across published weeks.",
    tone: "muted" as const,
  },
];

export default function ManagerPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadStores() {
      const { data, error } = await supabase.from("stores").select("*");

      if (error) {
        console.error("Supabase error:", error);
        setErrorMessage(error.message);
      } else {
        setStores(data || []);
      }

      setLoading(false);
    }

    loadStores();
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          TanShift
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Manager dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
          You have full visibility across stores, rosters, availability, and
          requests. Jump into a workflow below.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`group rounded-3xl border p-5 shadow-sm transition ${
              card.tone === "accent"
                ? "border-[var(--ts-accent)]/30 bg-white hover:border-[var(--ts-accent)]"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <h2 className="text-lg font-semibold text-slate-900 group-hover:text-[var(--ts-accent-fg)]">
              {card.title}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{card.description}</p>
            <p className="mt-4 text-sm font-medium text-[var(--ts-accent-fg)]">
              Open →
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Stores</h2>

        {loading && (
          <p className="mt-2 text-sm text-slate-600">Loading stores…</p>
        )}

        {!loading && errorMessage && (
          <p className="mt-2 text-sm text-red-600">Error: {errorMessage}</p>
        )}

        {!loading && !errorMessage && stores.length === 0 && (
          <p className="mt-2 text-sm text-slate-600">No stores found.</p>
        )}

        {!loading && !errorMessage && stores.length > 0 && (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {stores.map((store) => (
              <li
                key={store.id}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <p className="font-medium text-slate-900">{store.name}</p>
                <p className="text-sm text-slate-600">
                  {store.open_time} – {store.close_time}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
