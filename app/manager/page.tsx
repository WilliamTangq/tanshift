"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, PageContainer, PageHeader, StatCard } from "@/components/ui-system";

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
    <PageContainer>
      <PageHeader
        title="Manager Dashboard"
        description="Monitor your operations, build schedules, and manage team workflows from one place."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Workflows" value="6" hint="Core manager modules" />
        <StatCard label="Stores" value={loading ? "..." : String(stores.length)} />
        <StatCard label="Primary View" value="Schedule" hint="Main planning surface" />
        <StatCard label="Status" value="Live" hint="Supabase-backed" />
        <StatCard label="Mobile" value="Ready" hint="Bottom nav supported" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <Card title="Stores" subtitle="Active locations connected to this workspace.">

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
      </Card>
    </PageContainer>
  );
}
