"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type StaffProfile = {
  id: string;
  name: string;
  department: "front" | "kitchen";
  skill_level: "all_rounder" | "normal";
};

type ShiftRow = {
  id: string;
  shift_date: string;
  department: "front" | "kitchen";
  assigned_staff_id: string | null;
  shift_start: string;
  shift_end: string;
};

const DAYS = [
  { value: 0, label: "Monday" },
  { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" },
  { value: 5, label: "Saturday" },
  { value: 6, label: "Sunday" },
];

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getNextMondayDate() {
  const today = new Date();
  const localToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const day = localToday.getDay();
  const diff = day === 0 ? 1 : 8 - day;

  const nextMonday = new Date(localToday);
  nextMonday.setDate(localToday.getDate() + diff);

  return formatLocalDate(nextMonday);
}

function addDays(dateString: string, days: number) {
  const date = parseLocalDate(dateString);
  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
}

function calculateMinutes(start: string, end: string) {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;

  return Math.max(endTotal - startTotal, 0);
}

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours === 0) {
    return `${mins} mins`;
  }

  if (mins === 0) {
    return `${hours} hours`;
  }

  return `${hours} hours ${mins} mins`;
}

export default function StaffSchedulePage() {
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [weekStartDate, setWeekStartDate] = useState(getNextMondayDate());
  const [shifts, setShifts] = useState<ShiftRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStaff() {
      const { data, error } = await supabase
        .from("staff_profiles")
        .select("id, name, department, skill_level")
        .eq("active", true)
        .order("name", { ascending: true });

      if (error) {
        console.error("Failed to load staff:", error);
      } else {
        setStaffList((data as StaffProfile[]) || []);
      }
    }

    loadStaff();
  }, []);

  useEffect(() => {
    async function loadSchedule() {
      if (!selectedStaffId || !weekStartDate) {
        setShifts([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data: weekData, error: weekError } = await supabase
        .from("schedule_weeks")
        .select("id")
        .eq("week_start_date", weekStartDate)
        .maybeSingle();

      if (weekError) {
        console.error("Failed to load schedule week:", weekError);
        setShifts([]);
        setLoading(false);
        return;
      }

      if (!weekData) {
        setShifts([]);
        setLoading(false);
        return;
      }

      const { data: shiftData, error: shiftError } = await supabase
        .from("scheduled_shifts")
        .select("*")
        .eq("schedule_week_id", weekData.id)
        .eq("assigned_staff_id", selectedStaffId)
        .order("shift_date", { ascending: true })
        .order("shift_start", { ascending: true });

      if (shiftError) {
        console.error("Failed to load staff schedule:", shiftError);
        setShifts([]);
      } else {
        setShifts((shiftData as ShiftRow[]) || []);
      }

      setLoading(false);
    }

    loadSchedule();
  }, [selectedStaffId, weekStartDate]);

  const groupedByDay = useMemo(() => {
    const result: Record<string, ShiftRow[]> = {};

    for (const day of DAYS) {
      const date = addDays(weekStartDate, day.value);
      result[date] = shifts.filter((shift) => shift.shift_date === date);
    }

    return result;
  }, [shifts, weekStartDate]);

  const totalMinutes = useMemo(() => {
    return shifts.reduce((sum, shift) => {
      return sum + calculateMinutes(shift.shift_start, shift.shift_end);
    }, 0);
  }, [shifts]);

  const selectedStaff = useMemo(() => {
    return staffList.find((staff) => staff.id === selectedStaffId) || null;
  }, [staffList, selectedStaffId]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Schedule</h1>
            <p className="mt-2 text-sm text-slate-600">
              View your shifts for the selected week.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Staff Member
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
              >
                <option value="">Select staff</option>
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} · {staff.department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Week Start Date
              </label>
              <input
                type="date"
                value={weekStartDate}
                onChange={(e) => setWeekStartDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>
          </div>
        </div>

        {selectedStaff && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {selectedStaff.name}
                </h2>
                <p className="text-sm text-slate-600">
                  {selectedStaff.department} · {selectedStaff.skill_level}
                </p>
              </div>

              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                Total: {formatMinutes(totalMinutes)}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          {loading ? (
            <p className="text-sm text-slate-600">Loading schedule...</p>
          ) : !selectedStaffId ? (
            <p className="text-sm text-slate-600">
              Select a staff member to view schedule.
            </p>
          ) : (
            <div className="space-y-4">
              {DAYS.map((day) => {
                const date = addDays(weekStartDate, day.value);
                const dayShifts = groupedByDay[date] || [];

                return (
                  <div
                    key={date}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900">{day.label}</h3>
                      <span className="text-sm text-slate-500">{date}</span>
                    </div>

                    {dayShifts.length === 0 ? (
                      <p className="mt-3 text-sm text-slate-600">No shift assigned.</p>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {dayShifts.map((shift) => (
                          <div
                            key={shift.id}
                            className="rounded-2xl bg-white p-3"
                          >
                            <p className="font-medium text-slate-900">
                              {shift.department}
                            </p>
                            <p className="text-sm text-slate-600">
                              {shift.shift_start} - {shift.shift_end}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatMinutes(
                                calculateMinutes(
                                  shift.shift_start,
                                  shift.shift_end,
                                ),
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}