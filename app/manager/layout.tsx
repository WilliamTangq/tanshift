"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ManagerShell } from "@/components/app-shell";
import { useSession } from "@/lib/session-context";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { role, hydrated } = useSession();

  useEffect(() => {
    if (!hydrated) return;
    if (role === "staff") {
      router.replace("/staff");
      return;
    }
    if (role !== "manager") {
      router.replace("/");
    }
  }, [role, hydrated, router]);

  if (!hydrated || role !== "manager") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--ts-bg)] px-6">
        <p className="text-sm text-slate-600">Loading…</p>
      </div>
    );
  }

  return <ManagerShell>{children}</ManagerShell>;
}
