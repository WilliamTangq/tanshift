"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Store = {
  id: string;
  name: string;
};

type StaffProfile = {
  id: string;
  name: string;
  department: "front" | "kitchen";
  skill_level: "all_rounder" | "normal";
  priority_level: "high" | "medium" | "low";
};

type AvailabilitySubmission = {
  id: string;
  staff_id: string;
  week_start_date: string;
};

type AvailabilitySlot = {
  id: string;
  submission_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

type ScheduleWeek = {
  id: string;
  week_start_date: string;
  status: "draft" | "published";
  store_id: string;
};

type ShiftRow = {
  id: string;
  schedule_week_id: string;
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

  const day = localToday.getDay(); // Sunday = 0
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

function parseLocalDateToMidnight(dateString: string) {
  // Re-use parsing that matches how we format locally for schedule_weeks.
  return parseLocalDate(dateString);
}

function getStaffDayOfWeek(dateString: string) {
  // Staff availability uses 1=Mon ... 7=Sun.
  const date = parseLocalDateToMidnight(dateString);
  const jsDay = date.getDay(); // 0=Sun..6=Sat
  return jsDay === 0 ? 7 : jsDay;
}

function isDateWithinWeek(weekStartDate: string, dateString: string) {
  const weekStart = parseLocalDateToMidnight(weekStartDate);
  const date = parseLocalDateToMidnight(dateString);
  const diffDays = Math.floor((date.getTime() - weekStart.getTime()) / 86400000);
  return diffDays >= 0 && diffDays <= 6;
}

export default function SchedulePage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [scheduleWeek, setScheduleWeek] = useState<ScheduleWeek | null>(null);
  const [shifts, setShifts] = useState<ShiftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [weekStartDate, setWeekStartDate] = useState(getNextMondayDate());

  const [shiftDate, setShiftDate] = useState(getNextMondayDate());
  const [department, setDepartment] = useState<"front" | "kitchen">("front");
  const [assignedStaffId, setAssignedStaffId] = useState("");
  const [shiftStart, setShiftStart] = useState("10:30");
  const [shiftEnd, setShiftEnd] = useState("21:15");

  const [availabilitySubmissions, setAvailabilitySubmissions] = useState<AvailabilitySubmission[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);

      const { data: storeData } = await supabase
        .from("stores")
        .select("id, name")
        .order("created_at", { ascending: true });

      const storesList = (storeData as Store[]) || [];
      setStores(storesList);

      if (storesList.length > 0) {
        setSelectedStoreId(storesList[0].id);
      }

      const { data: staffData } = await supabase
        .from("staff_profiles")
        .select("id, name, department, skill_level, priority_level")
        .eq("active", true)
        .order("name", { ascending: true });

      setStaff((staffData as StaffProfile[]) || []);

      setLoading(false);
    }

    loadInitialData();
  }, []);

  useEffect(() => {
    if (!selectedStoreId || !weekStartDate) return;
    loadScheduleWeek(selectedStoreId, weekStartDate);
  }, [selectedStoreId, weekStartDate]);

  useEffect(() => {
    // Keep the "Shift Date" aligned with the selected schedule week.
    // If the user changes the week, but the shift date is outside that week, reset it to Monday.
    if (!weekStartDate) return;
    if (!isDateWithinWeek(weekStartDate, shiftDate)) {
      setShiftDate(weekStartDate);
    }
  }, [weekStartDate, shiftDate]);

  useEffect(() => {
    async function loadAvailabilityForWeek() {
      if (!weekStartDate) return;

      setAvailabilityLoading(true);
      try {
        const { data: submissionData, error: submissionError } = await supabase
          .from("availability_submissions")
          .select("id, staff_id, week_start_date")
          .eq("week_start_date", weekStartDate)
          .eq("status", "submitted");

        if (submissionError) throw submissionError;

        const submissions = (submissionData as AvailabilitySubmission[]) || [];
        setAvailabilitySubmissions(submissions);

        const submissionIds = submissions.map((s) => s.id);
        if (submissionIds.length === 0) {
          setAvailabilitySlots([]);
          return;
        }

        const { data: slotData, error: slotError } = await supabase
          .from("availability_slots")
          .select("id, submission_id, day_of_week, start_time, end_time")
          .in("submission_id", submissionIds)
          .order("day_of_week", { ascending: true })
          .order("start_time", { ascending: true });

        if (slotError) throw slotError;
        setAvailabilitySlots((slotData as AvailabilitySlot[]) || []);
      } catch (err) {
        console.error("Failed to load availability:", err);
        setAvailabilitySubmissions([]);
        setAvailabilitySlots([]);
      } finally {
        setAvailabilityLoading(false);
      }
    }

    loadAvailabilityForWeek();
  }, [weekStartDate]);

  async function loadScheduleWeek(storeId: string, weekDate: string) {
    setLoading(true);

    const {
      data: existingWeekData,
      error: existingWeekError,
    } = await supabase
      .from("schedule_weeks")
      .select("*")
      .eq("store_id", storeId)
      .eq("week_start_date", weekDate)
      .maybeSingle();

    if (existingWeekError) {
      console.error("Failed to load schedule week:", existingWeekError);
      setLoading(false);
      return;
    }

    let existingWeek = existingWeekData;
    if (!existingWeek) {
      const { data: newWeek, error: createError } = await supabase
        .from("schedule_weeks")
        .insert({
          store_id: storeId,
          week_start_date: weekDate,
          status: "draft",
        })
        .select()
        .single();

      if (createError) {
        console.error("Failed to create schedule week:", createError);
        setLoading(false);
        return;
      }

      existingWeek = newWeek;
    }

    setScheduleWeek(existingWeek as ScheduleWeek);

    const { data: shiftData, error: shiftError } = await supabase
      .from("scheduled_shifts")
      .select("*")
      .eq("schedule_week_id", existingWeek.id)
      .order("shift_date", { ascending: true })
      .order("department", { ascending: true })
      .order("shift_start", { ascending: true });

    if (shiftError) {
      console.error("Failed to load shifts:", shiftError);
    } else {
      setShifts((shiftData as ShiftRow[]) || []);
    }

    setShiftDate(weekDate);
    setLoading(false);
  }

  async function handleAddShift(e: FormEvent) {
    e.preventDefault();

    if (!scheduleWeek) {
      alert("Schedule week is not ready yet.");
      return;
    }

    if (!assignedStaffId) {
      alert("Please select a staff member.");
      return;
    }

    if (!isDateWithinWeek(weekStartDate, shiftDate)) {
      alert("Shift date must be within the selected week.");
      return;
    }

    // Enforce staff availability when submitting a shift.
    if (availabilityLoading) {
      alert("Loading staff availability. Please try again in a moment.");
      return;
    }

    if (!availabilityLoading) {
      const staffDayOfWeek = getStaffDayOfWeek(shiftDate);

      const matchingSlots = availabilitySlots.filter((slot) => {
        const submission = availabilitySubmissions.find((s) => s.id === slot.submission_id);
        if (!submission) return false;
        if (submission.staff_id !== assignedStaffId) return false;
        if (slot.day_of_week !== staffDayOfWeek) return false;
        // Require the shift to fit within the submitted availability window.
        return shiftStart >= slot.start_time && shiftEnd <= slot.end_time;
      });

      if (matchingSlots.length === 0) {
        alert("Selected staff is not available for this day/time (based on submitted availability).");
        return;
      }
    }

    setSaving(true);

    const { error } = await supabase.from("scheduled_shifts").insert({
      schedule_week_id: scheduleWeek.id,
      shift_date: shiftDate,
      department,
      assigned_staff_id: assignedStaffId,
      shift_start: shiftStart,
      shift_end: shiftEnd,
    });

    if (error) {
      console.error("Failed to add shift:", error);
      alert(`Failed to add shift: ${error.message}`);
    } else {
      setAssignedStaffId("");
      await loadScheduleWeek(selectedStoreId, weekStartDate);
    }

    setSaving(false);
  }

  async function handleDeleteShift(shiftId: string) {
    const confirmed = window.confirm("Delete this shift?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("scheduled_shifts")
      .delete()
      .eq("id", shiftId);

    if (error) {
      console.error("Failed to delete shift:", error);
      alert(`Failed to delete shift: ${error.message}`);
    } else {
      await loadScheduleWeek(selectedStoreId, weekStartDate);
    }
  }

  async function handleTogglePublishSchedule() {
    if (!scheduleWeek) {
      alert("Schedule week is not ready yet.");
      return;
    }

    const isPublished = scheduleWeek.status === "published";

    const confirmed = window.confirm(
      isPublished
        ? "Unpublish this schedule and move it back to draft?"
        : "Publish this schedule?"
    );

    if (!confirmed) return;

    const updates = isPublished
      ? { status: "draft", published_at: null }
      : { status: "published", published_at: new Date().toISOString() };

    const { data, error } = await supabase
      .from("schedule_weeks")
      .update(updates)
      .eq("id", scheduleWeek.id)
      .select();

    if (error) {
      console.error("Failed to update publish status:", error);
      alert(`Failed to update schedule: ${error.message}`);
      return;
    }

    console.log("Updated schedule week:", data);

    await loadScheduleWeek(selectedStoreId, weekStartDate);

    alert(
      isPublished
        ? "Schedule moved back to draft."
        : "Schedule published successfully."
    );
  }

  const filteredStaff = useMemo(() => {
    return staff.filter((member) => member.department === department);
  }, [staff, department]);

  const staffNameMap = useMemo(() => {
    return Object.fromEntries(staff.map((member) => [member.id, member.name]));
  }, [staff]);

  const submissionIdToStaffId = useMemo(() => {
    return Object.fromEntries(
      availabilitySubmissions.map((s) => [s.id, s.staff_id])
    ) as Record<string, string>;
  }, [availabilitySubmissions]);

  const availabilitySlotsByStaffId = useMemo(() => {
    const map: Record<string, AvailabilitySlot[]> = {};
    for (const slot of availabilitySlots) {
      const staffId = submissionIdToStaffId[slot.submission_id];
      if (!staffId) continue;
      if (!map[staffId]) map[staffId] = [];
      map[staffId].push(slot);
    }
    return map;
  }, [availabilitySlots, submissionIdToStaffId]);

  const selectedStaffDayOfWeek = useMemo(() => {
    if (!shiftDate) return null;
    return getStaffDayOfWeek(shiftDate);
  }, [shiftDate]);

  const isStaffAvailableForSelectedShift = useMemo(() => {
    // Map staff_id -> available boolean for current day/time selection.
    const dayOfWeek = selectedStaffDayOfWeek;
    const start = shiftStart;
    const end = shiftEnd;

    const map: Record<string, boolean> = {};
    for (const member of filteredStaff) {
      if (!dayOfWeek) {
        map[member.id] = false;
        continue;
      }

      const staffSlots = availabilitySlotsByStaffId[member.id] || [];
      const isAvailable = staffSlots.some((slot) => {
        if (slot.day_of_week !== dayOfWeek) return false;
        return start >= slot.start_time && end <= slot.end_time;
      });
      map[member.id] = isAvailable;
    }
    return map;
  }, [filteredStaff, availabilitySlotsByStaffId, selectedStaffDayOfWeek, shiftStart, shiftEnd]);

  const availableStaffCount = useMemo(() => {
    return filteredStaff.reduce((acc, member) => acc + (isStaffAvailableForSelectedShift[member.id] ? 1 : 0), 0);
  }, [filteredStaff, isStaffAvailableForSelectedShift]);

  const isAssignedStaffAvailable = useMemo(() => {
    if (!assignedStaffId) return false;
    return !!isStaffAvailableForSelectedShift[assignedStaffId];
  }, [assignedStaffId, isStaffAvailableForSelectedShift]);

  useEffect(() => {
    // If the currently selected staff becomes unavailable due to date/time changes, clear the selection.
    if (!assignedStaffId) return;
    if (availabilityLoading) return;
    if (!isAssignedStaffAvailable) setAssignedStaffId("");
  }, [assignedStaffId, isAssignedStaffAvailable, availabilityLoading]);

  const weeklyHours = useMemo(() => {
    const totals: Record<string, number> = {};

    for (const shift of shifts) {
      if (!shift.assigned_staff_id) continue;
      const hours = calculateHours(shift.shift_start, shift.shift_end);
      totals[shift.assigned_staff_id] = (totals[shift.assigned_staff_id] || 0) + hours;
    }

    return totals;
  }, [shifts]);

  const groupedByDay = useMemo(() => {
    const result: Record<string, ShiftRow[]> = {};

    for (const day of DAYS) {
      const date = addDays(weekStartDate, day.value);
      result[date] = shifts.filter((shift) => shift.shift_date === date);
    }

    return result;
  }, [shifts, weekStartDate]);

  return (
    <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Schedule</h1>
            <p className="mt-2 text-sm text-slate-600">
              Build weekly shifts for front and kitchen teams.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Store
              </label>
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
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

        <div className="mt-8 grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)_280px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Add Shift</h2>

            <form onSubmit={handleAddShift} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Shift Date
                </label>
                <input
                  type="date"
                  value={shiftDate}
                  onChange={(e) => setShiftDate(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) =>
                    setDepartment(e.target.value as "front" | "kitchen")
                  }
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                >
                  <option value="front">Front</option>
                  <option value="kitchen">Kitchen</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Staff Member
                </label>
                <select
                  value={assignedStaffId}
                  onChange={(e) => setAssignedStaffId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                >
                  <option value="">Select staff</option>
                  {filteredStaff.map((member) => (
                    <option
                      key={member.id}
                      value={member.id}
                      disabled={!availabilityLoading && !isStaffAvailableForSelectedShift[member.id]}
                    >
                      {member.name} · {member.skill_level}
                      {!availabilityLoading && !isStaffAvailableForSelectedShift[member.id]
                        ? " (Unavailable)"
                        : ""}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-500">
                  {availabilityLoading
                    ? "Loading availability..."
                    : `Available for this day/time: ${availableStaffCount}/${filteredStaff.length}`}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Start
                  </label>
                  <input
                    type="time"
                    value={shiftStart}
                    onChange={(e) => setShiftStart(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    End
                  </label>
                  <input
                    type="time"
                    value={shiftEnd}
                    onChange={(e) => setShiftEnd(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Add Shift"}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Weekly Schedule</h2>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {scheduleWeek?.status || "draft"}
                </span>
                <button
                  type="button"
                  onClick={handleTogglePublishSchedule}
                  disabled={!scheduleWeek || loading}
                  className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                >
                  {scheduleWeek?.status === "published" ? "Unpublish" : "Publish"}
                </button>
              </div>
            </div>

            {loading ? (
              <p className="mt-4 text-sm text-slate-600">Loading schedule...</p>
            ) : (
              <div className="mt-4 space-y-4">
                {DAYS.map((day) => {
                  const date = addDays(weekStartDate, day.value);
                  const dayShifts = groupedByDay[date] || [];

                  return (
                    <div
                      key={date}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900">
                          {day.label}
                        </h3>
                        <span className="text-sm text-slate-500">{date}</span>
                      </div>

                      {dayShifts.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-600">
                          No shifts added.
                        </p>
                      ) : (
                        <div className="mt-3 space-y-2">
                          {dayShifts.map((shift) => (
                            <div
                              key={shift.id}
                              className="flex flex-col gap-3 rounded-2xl bg-white p-3 md:flex-row md:items-center md:justify-between"
                            >
                              <div>
                                <p className="font-medium text-slate-900">
                                  {staffNameMap[shift.assigned_staff_id || ""] ||
                                    "Unassigned"}
                                </p>
                                <p className="text-sm text-slate-600">
                                  {shift.department} · {shift.shift_start} - {shift.shift_end}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteShift(shift.id)}
                                className="rounded-2xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </button>
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

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Weekly Hours</h2>

            {staff.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">No staff found.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {staff.map((member) => (
                  <div
                    key={member.id}
                    className="rounded-2xl bg-slate-50 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{member.name}</p>
                        <p className="text-xs text-slate-500">
                          {member.department} · {member.skill_level}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        {(weeklyHours[member.id] || 0).toFixed(1)}h
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
    </div>
  );
}