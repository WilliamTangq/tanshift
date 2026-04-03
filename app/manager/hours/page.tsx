"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

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
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Weekly hours</h1>
          <p className="mt-2 text-sm text-slate-600">
            Scheduled hours from published rosters for the week starting Monday.
          </p>
        </div>
        <div className="w-full md:w-56">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Week start (Monday)
          </label>
          <input
            type="date"
            value={weekStartDate}
            onChange={(e) => setWeekStartDate(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
          />
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
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
      </div>
    </div>
  );
}
