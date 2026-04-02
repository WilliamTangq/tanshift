"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type SubmissionRow = {
  id: string;
  week_start_date: string;
  note: string | null;
  submitted_at: string | null;
  status: "draft" | "submitted";
  staff_profiles: {
    id: string;
    name: string;
    department: "front" | "kitchen";
  } | null;
};

type SlotRow = {
  id: string;
  submission_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

const DAY_LABELS: Record<number, string> = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
};

export default function ManagerAvailabilityPage() {
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");

  useEffect(() => {
    async function loadAvailability() {
      setLoading(true);
      setErrorMessage("");

      const { data: submissionData, error: submissionError } = await supabase
        .from("availability_submissions")
        .select(`
          id,
          week_start_date,
          note,
          submitted_at,
          status,
          staff_profiles (
            id,
            name,
            department
          )
        `)
        .order("submitted_at", { ascending: false, nullsFirst: false });

      if (submissionError) {
        console.error("Failed to load submissions:", submissionError);
        setErrorMessage(submissionError.message);
        setLoading(false);
        return;
      }

      const typedSubmissions = (submissionData || []) as unknown as SubmissionRow[];
      setSubmissions(typedSubmissions);

      const { data: slotData, error: slotError } = await supabase
        .from("availability_slots")
        .select("*")
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });

      if (slotError) {
        console.error("Failed to load slots:", slotError);
        setErrorMessage(slotError.message);
      } else {
        setSlots((slotData || []) as SlotRow[]);
      }

      const latestWeek = typedSubmissions[0]?.week_start_date || "";
      setSelectedWeek(latestWeek);

      setLoading(false);
    }

    loadAvailability();
  }, []);

  const uniqueWeeks = useMemo(() => {
    const weeks = Array.from(new Set(submissions.map((s) => s.week_start_date)));
    return weeks.sort((a, b) => (a < b ? 1 : -1));
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    if (!selectedWeek) return submissions;
    return submissions.filter((s) => s.week_start_date === selectedWeek);
  }, [submissions, selectedWeek]);

  function getSlotsForSubmission(submissionId: string) {
    return slots.filter((slot) => slot.submission_id === submissionId);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Staff Availability</h1>
            <p className="mt-2 text-sm text-slate-600">
              Review submitted availability for each staff member.
            </p>
          </div>

          <div className="w-full md:w-72">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Filter by Week Start
            </label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
            >
              {uniqueWeeks.length === 0 && <option value="">No weeks found</option>}
              {uniqueWeeks.map((week) => (
                <option key={week} value={week}>
                  {week}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          {loading ? (
            <p className="text-sm text-slate-600">Loading availability...</p>
          ) : errorMessage ? (
            <p className="text-sm text-red-600">Error: {errorMessage}</p>
          ) : filteredSubmissions.length === 0 ? (
            <p className="text-sm text-slate-600">No availability submissions found.</p>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => {
                const submissionSlots = getSlotsForSubmission(submission.id);

                return (
                  <div
                    key={submission.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                          {submission.staff_profiles?.name || "Unknown Staff"}
                        </h2>
                        <p className="mt-1 text-sm text-slate-600">
                          Department: {submission.staff_profiles?.department || "-"}
                        </p>
                        <p className="text-sm text-slate-600">
                          Week Start: {submission.week_start_date}
                        </p>
                        <p className="text-sm text-slate-600">
                          Status: {submission.status}
                        </p>
                      </div>

                      <div className="text-sm text-slate-500">
                        {submission.submitted_at
                          ? `Submitted: ${new Date(submission.submitted_at).toLocaleString()}`
                          : "Not submitted"}
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-slate-800">
                        Availability Slots
                      </h3>

                      {submissionSlots.length === 0 ? (
                        <p className="mt-2 text-sm text-slate-600">
                          No slots found.
                        </p>
                      ) : (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {submissionSlots.map((slot) => (
                            <div
                              key={slot.id}
                              className="rounded-full bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
                            >
                              {DAY_LABELS[slot.day_of_week]} · {slot.start_time} -{" "}
                              {slot.end_time}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {submission.note && (
                      <div className="mt-4 rounded-2xl bg-white p-4">
                        <p className="text-sm font-medium text-slate-800">Note</p>
                        <p className="mt-1 text-sm text-slate-600">{submission.note}</p>
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