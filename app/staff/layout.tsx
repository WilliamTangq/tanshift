"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { StaffShell } from "@/components/app-shell";
import { useSession } from "@/lib/session-context";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { role, staffProfileId, hydrated } = useSession();

  useEffect(() => {
    if (!hydrated) return;
    if (role === "manager") {
      router.replace("/manager");
      return;
    }
    if (role !== "staff" || !staffProfileId) {
      router.replace("/");
    }
  }, [role, staffProfileId, hydrated, router]);

  if (!hydrated || role !== "staff" || !staffProfileId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--ts-bg)] px-6">
        <p className="text-sm text-slate-600">Loading…</p>
      </div>
    );
  }

  return <StaffShell>{children}</StaffShell>;
}
