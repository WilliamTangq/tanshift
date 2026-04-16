"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, FieldLabel, Input, PageContainer, PageHeader } from "@/components/ui-system";

type StaffProfile = {
  id: string;
  name: string;
  department: "front" | "kitchen";
};

type ShiftRow = {
  assigned_staff_id: string | null;
  shift_start: string;
  shift_end: string;
};

function weekStartMonday(d: Date) {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function formatYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function calculateHours(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startTotal = sh * 60 + sm;
  const endTotal = eh * 60 + em;
  return Math.max((endTotal - startTotal) / 60, 0);
}

export default function ManagerHoursPage() {
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [weekStartDate, setWeekStartDate] = useState(
    formatYmd(weekStartMonday(new Date()))
  );
  const [shifts, setShifts] = useState<ShiftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState("");

  useEffect(() => {
    async function loadStaff() {
      const { data, error } = await supabase
        .from("staff_profiles")
        .select("id, name, department")
        .eq("active", true)
        .order("name", { ascending: true });

      if (error) {
        console.error(error);
      } else {
        setStaff((data as StaffProfile[]) || []);
      }
    }
    loadStaff();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setInfo("");

      const { data: weekData, error: weekError } = await supabase
        .from("schedule_weeks")
        .select("id")
        .eq("week_start_date", weekStartDate)
        .eq("status", "published")
        .maybeSingle();

      if (cancelled) return;

      if (weekError) {
        console.error(weekError);
        setShifts([]);
        setInfo("Could not load week.");
        setLoading(false);
        return;
      }

      if (!weekData) {
        setShifts([]);
        setInfo("No published schedule for this week.");
        setLoading(false);
        return;
      }

      const { data: shiftData, error: shiftError } = await supabase
        .from("scheduled_shifts")
        .select("assigned_staff_id, shift_start, shift_end")
        .eq("schedule_week_id", weekData.id);

      if (cancelled) return;

      if (shiftError) {
        console.error(shiftError);
        setShifts([]);
        setInfo("Could not load shifts.");
      } else {
        setShifts((shiftData as ShiftRow[]) || []);
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [weekStartDate]);

  const hoursByStaff = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const shift of shifts) {
      if (!shift.assigned_staff_id) continue;
      const h = calculateHours(shift.shift_start, shift.shift_end);
      totals[shift.assigned_staff_id] =
        (totals[shift.assigned_staff_id] || 0) + h;
    }
    return totals;
  }, [shifts]);

  return (
    <PageContainer>
      <PageHeader
        title="Weekly Hours"
        description="Scheduled hours from published rosters for the selected week."
        actions={
          <div className="w-full sm:w-56">
            <FieldLabel>Week start (Monday)</FieldLabel>
            <Input
            type="date"
            value={weekStartDate}
            onChange={(e) => setWeekStartDate(e.target.value)}
            />
          </div>
        }
      />

      <Card>
        {loading ? (
          <p className="text-sm text-slate-600">Loading…</p>
        ) : info ? (
          <p className="text-sm text-slate-600">{info}</p>
        ) : staff.length === 0 ? (
          <p className="text-sm text-slate-600">No active staff.</p>
        ) : (
          <div className="space-y-2">
            {staff.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-900">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.department}</p>
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  {(hoursByStaff[member.id] || 0).toFixed(1)}h
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
