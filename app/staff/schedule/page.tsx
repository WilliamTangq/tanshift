"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session-context";
import { Badge, Card, EmptyState, FieldLabel, Input, PageContainer, PageHeader, StatCard } from "@/components/ui-system";

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

function calculateHours(start: string, end: string) {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;

  return Math.max((endTotal - startTotal) / 60, 0);
}

export default function StaffSchedulePage() {
  const { staffProfileId, staffName } = useSession();
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [weekStartDate, setWeekStartDate] = useState(getNextMondayDate());
  const [shifts, setShifts] = useState<ShiftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [infoMessage, setInfoMessage] = useState("");
  const pollTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!staffProfileId) return;

    async function loadProfile() {
      const { data, error } = await supabase
        .from("staff_profiles")
        .select("id, name, department, skill_level")
        .eq("id", staffProfileId)
        .maybeSingle();

      if (error) {
        console.error("Failed to load profile:", error);
      } else {
        setProfile((data as StaffProfile) || null);
      }
    }

    loadProfile();
  }, [staffProfileId]);

  useEffect(() => {
    let cancelled = false;

    async function fetchSchedule({ showLoading }: { showLoading: boolean }) {
      if (!staffProfileId || !weekStartDate) {
        if (cancelled) return;
        setShifts([]);
        setInfoMessage("");
        if (showLoading) setLoading(false);
        return;
      }

      if (showLoading) setLoading(true);

      const { data: weekData, error: weekError } = await supabase
        .from("schedule_weeks")
        .select("id")
        .eq("week_start_date", weekStartDate)
        .eq("status", "published")
        .maybeSingle();

      if (cancelled) return;

      if (weekError) {
        console.error("Failed to load schedule week:", weekError);
        setShifts([]);
        if (showLoading) setLoading(false);
        return;
      }

      if (!weekData) {
        setShifts([]);
        setInfoMessage("Schedule has not been published yet.");
        if (showLoading) setLoading(false);
        return;
      }

      const { data: shiftData, error: shiftError } = await supabase
        .from("scheduled_shifts")
        .select("*")
        .eq("schedule_week_id", weekData.id)
        .eq("assigned_staff_id", staffProfileId)
        .order("shift_date", { ascending: true })
        .order("shift_start", { ascending: true });

      if (cancelled) return;

      if (shiftError) {
        console.error("Failed to load staff schedule:", shiftError);
        setShifts([]);
      } else {
        setShifts((shiftData as ShiftRow[]) || []);
      }

      setInfoMessage("");
      if (showLoading) setLoading(false);
    }

    // Initial load
    fetchSchedule({ showLoading: true });

    // Keep staff view in sync after manager publish/unpublish.
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    pollTimerRef.current = window.setInterval(() => {
      fetchSchedule({ showLoading: false });
    }, 10000);

    return () => {
      cancelled = true;
      if (pollTimerRef.current) {
        window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [staffProfileId, weekStartDate]);

  const groupedByDay = useMemo(() => {
    const result: Record<string, ShiftRow[]> = {};

    for (const day of DAYS) {
      const date = addDays(weekStartDate, day.value);
      result[date] = shifts.filter((shift) => shift.shift_date === date);
    }

    return result;
  }, [shifts, weekStartDate]);

  const totalHours = useMemo(() => {
    return shifts.reduce((sum, shift) => {
      return sum + calculateHours(shift.shift_start, shift.shift_end);
    }, 0);
  }, [shifts]);

  const selectedStaff = useMemo(() => {
    if (profile) return profile;
    if (staffProfileId && staffName) {
      return {
        id: staffProfileId,
        name: staffName,
        department: "front" as const,
        skill_level: "normal" as const,
      };
    }
    return null;
  }, [profile, staffProfileId, staffName]);

  return (
    <PageContainer>
        <PageHeader
          title="My Schedule"
          description="View your published shifts and total weekly hours."
          actions={
            <div className="w-full max-w-xs">
              <FieldLabel>Week start (Monday)</FieldLabel>
              <Input
              type="date"
              value={weekStartDate}
              onChange={(e) => setWeekStartDate(e.target.value)}
              />
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Hours" value={`${totalHours.toFixed(1)}h`} />
          <StatCard label="Assigned Shifts" value={String(shifts.length)} />
          <StatCard label="Week" value={weekStartDate} />
        </div>

        {selectedStaff && (
          <Card>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {selectedStaff.name}
                </h2>
                <p className="text-sm text-slate-600">
                  {selectedStaff.department} · {selectedStaff.skill_level}
                </p>
              </div>
              <Badge tone="info">Total: {totalHours.toFixed(1)}h</Badge>
            </div>
          </Card>
        )}

        <Card title="Day-by-day schedule">
          {loading ? (
            <p className="text-sm text-slate-600">Loading schedule...</p>
          ) : !staffProfileId ? (
            <p className="text-sm text-slate-600">Missing staff session.</p>
          ) : infoMessage ? (
            <EmptyState>{infoMessage}</EmptyState>
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
                      <EmptyState>No shift assigned.</EmptyState>
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
                              {(calculateHours(shift.shift_start, shift.shift_end)).toFixed(1)} hours
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
        </Card>
    </PageContainer>
  );
}