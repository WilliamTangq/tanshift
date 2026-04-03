"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session-context";

type StaffProfile = {
  id: string;
  name: string;
  department: "front" | "kitchen";
};

type Slot = {
  day_of_week: number;
  start_time: string;
  end_time: string;
};

const DAYS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

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

  const year = nextMonday.getFullYear();
  const month = String(nextMonday.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(nextMonday.getDate()).padStart(2, "0");
  return `${year}-${month}-${dayOfMonth}`;
}

export default function StaffAvailabilityPage() {
  const { staffProfileId, staffName } = useSession();
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [weekStartDate, setWeekStartDate] = useState(getNextMondayDate());
  const [note, setNote] = useState("");
  const [slots, setSlots] = useState<Slot[]>([
    { day_of_week: 1, start_time: "10:00", end_time: "21:30" },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!staffProfileId) return;

    async function loadProfile() {
      const { data, error } = await supabase
        .from("staff_profiles")
        .select("id, name, department")
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

  const selectedStaff = useMemo(() => {
    if (profile) return profile;
    if (staffProfileId && staffName) {
      return { id: staffProfileId, name: staffName, department: "front" as const };
    }
    return undefined;
  }, [profile, staffProfileId, staffName]);

  function updateSlot(index: number, field: keyof Slot, value: string | number) {
    setSlots((prev) =>
      prev.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      )
    );
  }

  function addSlot() {
    setSlots((prev) => [
      ...prev,
      { day_of_week: 1, start_time: "10:00", end_time: "21:30" },
    ]);
  }

  function removeSlot(index: number) {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!staffProfileId) {
      alert("Missing staff session.");
      return;
    }

    if (slots.length === 0) {
      alert("Please add at least one availability slot.");
      return;
    }

    setSaving(true);

    const { data: submissionData, error: submissionError } = await supabase
      .from("availability_submissions")
      .insert({
        staff_id: staffProfileId,
        week_start_date: weekStartDate,
        note,
        status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (submissionError) {
      console.error("Failed to create submission:", submissionError);
      alert(`Failed to save availability: ${submissionError.message}`);
      setSaving(false);
      return;
    }

    const submissionId = submissionData.id;

    const slotPayload = slots.map((slot) => ({
      submission_id: submissionId,
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
    }));

    const { error: slotsError } = await supabase
      .from("availability_slots")
      .insert(slotPayload);

    if (slotsError) {
      console.error("Failed to save slots:", slotsError);
      alert(`Saved submission, but failed to save slots: ${slotsError.message}`);
      setSaving(false);
      return;
    }

    alert("Availability submitted successfully.");

    setNote("");
    setSlots([{ day_of_week: 1, start_time: "10:00", end_time: "21:30" }]);
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-900">Submit availability</h1>
        <p className="mt-2 text-sm text-slate-600">
          Submit next week&apos;s availability for yourself.
        </p>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Week Start Date (Monday)
              </label>
              <input
                type="date"
                value={weekStartDate}
                onChange={(e) => setWeekStartDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Availability Slots
              </label>

              <div className="space-y-3">
                {slots.map((slot, index) => (
                  <div
                    key={index}
                    className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-[1fr_1fr_1fr_auto]"
                  >
                    <select
                      value={slot.day_of_week}
                      onChange={(e) =>
                        updateSlot(index, "day_of_week", Number(e.target.value))
                      }
                      className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                    >
                      {DAYS.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>

                    <input
                      type="time"
                      value={slot.start_time}
                      onChange={(e) =>
                        updateSlot(index, "start_time", e.target.value)
                      }
                      className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                    />

                    <input
                      type="time"
                      value={slot.end_time}
                      onChange={(e) =>
                        updateSlot(index, "end_time", e.target.value)
                      }
                      className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                    />

                    <button
                      type="button"
                      onClick={() => removeSlot(index)}
                      className="rounded-2xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addSlot}
                className="mt-3 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Add Another Slot
              </button>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Note
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Optional note..."
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            {selectedStaff && (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                Submitting as:{" "}
                <span className="font-semibold">{selectedStaff.name}</span> (
                {selectedStaff.department})
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Submitting..." : "Submit Availability"}
            </button>
          </form>
        </div>
    </div>
  );
}