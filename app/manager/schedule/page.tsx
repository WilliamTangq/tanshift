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

  async function loadScheduleWeek(storeId: string, weekDate: string) {
    setLoading(true);

    let { data: existingWeek, error } = await supabase
      .from("schedule_weeks")
      .select("*")
      .eq("store_id", storeId)
      .eq("week_start_date", weekDate)
      .maybeSingle();

    if (error) {
      console.error("Failed to load schedule week:", error);
      setLoading(false);
      return;
    }

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

  

  const filteredStaff = useMemo(() => {
    return staff.filter((member) => member.department === department);
  }, [staff, department]);

  const staffNameMap = useMemo(() => {
    return Object.fromEntries(staff.map((member) => [member.id, member.name]));
  }, [staff]);

  const staffById = useMemo(() => {
    return Object.fromEntries(staff.map((m) => [m.id, m])) as Record<
      string,
      StaffProfile
    >;
  }, [staff]);

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
    <div className="min-h-screen bg-slate-50 p-6">
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
                    <option key={member.id} value={member.id}>
                      {member.name} · {member.skill_level}
                    </option>
                  ))}
                </select>
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
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {scheduleWeek?.status || "draft"}
              </span>
            </div>

            {loading ? (
              <p className="mt-4 text-sm text-slate-600">Loading schedule...</p>
            ) : (
              <div className="mt-4 space-y-4">
                {DAYS.map((day) => {
                  const date = addDays(weekStartDate, day.value);
                  const dayShifts = groupedByDay[date] || [];

                  const deptHasAllRounder = (dept: "front" | "kitchen") =>
                    dayShifts.some((shift) => {
                      if (shift.department !== dept || !shift.assigned_staff_id) {
                        return false;
                      }
                      const member = staffById[shift.assigned_staff_id];
                      return member?.skill_level === "all_rounder";
                    });

                  const frontCovered = deptHasAllRounder("front");
                  const kitchenCovered = deptHasAllRounder("kitchen");

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

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            frontCovered
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {frontCovered
                            ? "Front covered"
                            : "Front missing all-rounder"}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            kitchenCovered
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {kitchenCovered
                            ? "Kitchen covered"
                            : "Kitchen missing all-rounder"}
                        </span>
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
    </div>
  );
}