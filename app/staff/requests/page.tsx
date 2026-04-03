"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type StaffProfile = {
  id: string;
  name: string;
  department: "front" | "kitchen";
};

type ShiftRow = {
  id: string;
  shift_date: string;
  department: "front" | "kitchen";
  assigned_staff_id: string | null;
  shift_start: string;
  shift_end: string;
  schedule_week_id: string;
};

type RequestRow = {
  id: string;
  request_type: "leave" | "swap";
  reason: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  shift_id: string;
  counter_shift_id: string | null;
  from_staff_id: string;
  to_staff_id: string | null;
};

export default function StaffRequestsPage() {
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [publishedShifts, setPublishedShifts] = useState<ShiftRow[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);

  const [selectedShiftId, setSelectedShiftId] = useState("");
  const [toStaffId, setToStaffId] = useState("");
  const [counterShiftId, setCounterShiftId] = useState("");
  const [partnerShifts, setPartnerShifts] = useState<ShiftRow[]>([]);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadStaff() {
      const { data, error } = await supabase
        .from("staff_profiles")
        .select("id, name, department")
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
    async function loadStaffData() {
      if (!selectedStaffId) {
        setPublishedShifts([]);
        setRequests([]);
        return;
      }

      const { data: publishedWeeks, error: publishedWeeksError } = await supabase
        .from("schedule_weeks")
        .select("id")
        .eq("status", "published");

      if (publishedWeeksError) {
        console.error("Failed to load published schedule weeks:", publishedWeeksError);
        setPublishedShifts([]);
      } else {
        const publishedWeekIds = (publishedWeeks || []).map((week) => week.id);

        if (publishedWeekIds.length === 0) {
          setPublishedShifts([]);
        } else {
          const { data: shiftData, error: shiftError } = await supabase
            .from("scheduled_shifts")
            .select(`
              id,
              shift_date,
              department,
              assigned_staff_id,
              shift_start,
              shift_end,
              schedule_week_id
            `)
            .eq("assigned_staff_id", selectedStaffId)
            .in("schedule_week_id", publishedWeekIds)
            .order("shift_date", { ascending: true });

          if (shiftError) {
            console.error("Failed to load shifts:", shiftError);
            setPublishedShifts([]);
          } else {
            setPublishedShifts((shiftData as ShiftRow[]) || []);
          }
        }
      }

      const { data: requestData, error: requestError } = await supabase
        .from("time_off_requests")
        .select("*")
        .eq("from_staff_id", selectedStaffId)
        .order("created_at", { ascending: false });

      if (requestError) {
        console.error("Failed to load requests:", requestError);
        setRequests([]);
      } else {
        setRequests((requestData as RequestRow[]) || []);
      }
    }

    loadStaffData();
  }, [selectedStaffId]);

  useEffect(() => {
    async function loadPartnerShifts() {
      if (!selectedShiftId || !toStaffId) {
        setPartnerShifts([]);
        setCounterShiftId("");
        return;
      }

      const weekRow = publishedShifts.find((s) => s.id === selectedShiftId);
      if (!weekRow) {
        setPartnerShifts([]);
        setCounterShiftId("");
        return;
      }

      const { data, error } = await supabase
        .from("scheduled_shifts")
        .select(`
          id,
          shift_date,
          department,
          assigned_staff_id,
          shift_start,
          shift_end,
          schedule_week_id
        `)
        .eq("schedule_week_id", weekRow.schedule_week_id)
        .eq("assigned_staff_id", toStaffId)
        .order("shift_date", { ascending: true });

      if (error) {
        console.error("Failed to load partner shifts:", error);
        setPartnerShifts([]);
        setCounterShiftId("");
        return;
      }

      const list = (data as ShiftRow[]) || [];
      setPartnerShifts(list);
      setCounterShiftId((prev) => {
        if (prev && list.some((s) => s.id === prev)) return prev;
        return list[0]?.id ?? "";
      });
    }

    loadPartnerShifts();
  }, [selectedShiftId, toStaffId, publishedShifts]);

  const selectedShift = useMemo(
    () => publishedShifts.find((shift) => shift.id === selectedShiftId) || null,
    [publishedShifts, selectedShiftId]
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!selectedStaffId) {
      alert("Please select a staff member.");
      return;
    }

    if (!selectedShiftId) {
      alert("Please select a shift.");
      return;
    }

    if (!toStaffId) {
      alert("Please choose who you want to swap with.");
      return;
    }

    if (!counterShiftId) {
      alert(
        "Your swap partner has no shift in this published week, or you need to pick their shift to trade."
      );
      return;
    }

    if (counterShiftId === selectedShiftId) {
      alert("Pick two different shifts to swap.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("time_off_requests").insert({
      shift_id: selectedShiftId,
      counter_shift_id: counterShiftId,
      request_type: "swap",
      from_staff_id: selectedStaffId,
      to_staff_id: toStaffId,
      reason: reason.trim() || null,
      status: "pending",
    });

    if (error) {
      console.error("Failed to submit request:", error);
      alert(`Failed to submit request: ${error.message}`);
    } else {
      alert("Request submitted successfully.");
      setSelectedShiftId("");
      setToStaffId("");
      setCounterShiftId("");
      setReason("");

      const { data: requestData } = await supabase
        .from("time_off_requests")
        .select("*")
        .eq("from_staff_id", selectedStaffId)
        .order("created_at", { ascending: false });

      setRequests((requestData as RequestRow[]) || []);
    }

    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-slate-900">My Requests</h1>
        <p className="mt-2 text-sm text-slate-600">
          Request a swap between your shift and a colleague&apos;s shift on the published schedule.
        </p>
        <p className="mt-1 text-sm text-slate-500">
          After a manager approves, the schedule updates. Check{" "}
          <a href="/staff/schedule" className="font-medium text-slate-800 underline">
            My Schedule
          </a>{" "}
          for the week.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Submit Request</h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Staff Member
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => {
                    setSelectedStaffId(e.target.value);
                    setSelectedShiftId("");
                    setToStaffId("");
                    setCounterShiftId("");
                  }}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
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
                  Published Shift
                </label>
                <select
                  value={selectedShiftId}
                  onChange={(e) => {
                    setSelectedShiftId(e.target.value);
                    setCounterShiftId("");
                  }}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                >
                  <option value="">Select shift</option>
                  {publishedShifts.map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.shift_date} · {shift.department} · {shift.shift_start} - {shift.shift_end}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Swap With
                </label>
                <select
                  value={toStaffId}
                  onChange={(e) => {
                    setToStaffId(e.target.value);
                    setCounterShiftId("");
                  }}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                >
                  <option value="">Select staff</option>
                  {staffList
                    .filter((staff) => staff.id !== selectedStaffId)
                    .map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name} · {staff.department}
                      </option>
                    ))}
                </select>
              </div>

              {toStaffId && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Their shift to trade (same week)
                  </label>
                  <select
                    value={counterShiftId}
                    onChange={(e) => setCounterShiftId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  >
                    <option value="">
                      {partnerShifts.length === 0
                        ? "No published shifts for this person this week"
                        : "Select their shift"}
                    </option>
                    {partnerShifts.map((shift) => (
                      <option key={shift.id} value={shift.id}>
                        {shift.shift_date} · {shift.department} · {shift.shift_start} - {shift.shift_end}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Reason
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="Write your reason..."
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                />
              </div>

              {selectedShift && (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  Selected shift:{" "}
                  <span className="font-semibold">
                    {selectedShift.shift_date} · {selectedShift.department} · {selectedShift.shift_start} - {selectedShift.shift_end}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">My Request History</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {requests.length} requests
              </span>
            </div>

            {requests.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">No requests yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          {request.request_type === "leave"
                            ? "Leave Request (legacy)"
                            : "Swap Request"}
                        </p>
                        <p className="text-sm text-slate-500">
                          Submitted: {new Date(request.created_at).toLocaleString()}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          request.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : request.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>

                    {request.reason && (
                      <p className="mt-3 text-sm text-slate-700">{request.reason}</p>
                    )}
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