"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session-context";

type StaffProfile = {
  id: string;
  name: string;
  department: "front" | "kitchen";
  skill_level: "all_rounder" | "normal";
};

const links = [
  {
    href: "/staff/schedule",
    title: "My schedule",
    body: "See published shifts for the week you pick.",
  },
  {
    href: "/staff/availability",
    title: "Submit availability",
    body: "Send your hours for the upcoming week.",
  },
  {
    href: "/staff/requests",
    title: "Requests",
    body: "Request leave or a swap on a published shift.",
  },
];

export default function StaffHomePage() {
  const { staffProfileId, staffName } = useSession();
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!staffProfileId) return;

    async function load() {
      const { data, error } = await supabase
        .from("staff_profiles")
        .select("id, name, department, skill_level")
        .eq("id", staffProfileId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data as StaffProfile);
      }
      setLoading(false);
    }

    load();
  }, [staffProfileId]);

  const displayName = profile?.name || staffName || "Your profile";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Staff home
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          Hi, {displayName}
        </h1>
        {loading ? (
          <p className="mt-2 text-sm text-slate-600">Loading profile…</p>
        ) : profile ? (
          <p className="mt-2 text-sm text-slate-600">
            {profile.department} · {profile.skill_level.replace("_", " ")}
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-600">
            You are signed in to your staff profile only.
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[var(--ts-accent)]"
          >
            <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{item.body}</p>
            <p className="mt-4 text-sm font-medium text-[var(--ts-accent-fg)]">
              Open →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
