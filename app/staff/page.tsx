"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session-context";
import { Card, PageContainer, PageHeader, StatCard } from "@/components/ui-system";

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
    <PageContainer>
      <PageHeader title={`Hi, ${displayName}`} description="Your schedule, availability, and requests in one place." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Role" value="Staff" />
        <StatCard label="Department" value={profile?.department || "-"} />
        <StatCard label="Skill" value={profile?.skill_level.replace("_", " ") || "-"} />
      </div>

      {!loading && !profile && (
        <Card>
          <p className="text-sm text-slate-600">You are signed in to your staff profile only.</p>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
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
    </PageContainer>
  );
}
