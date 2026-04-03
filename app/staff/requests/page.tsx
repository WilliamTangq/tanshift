"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session-context";

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
  from_staff_id: string;
  to_staff_id: string | null;
};

export default function StaffRequestsPage() {
  const { staffProfileId } = useSession();
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [publishedShifts, setPublishedShifts] = useState<ShiftRow[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);

  const [selectedShiftId, setSelectedShiftId] = useState("");
  const [requestType, setRequestType] = useState<"leave" | "swap">("leave");
  const [toStaffId, setToStaffId] = useState("");
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
      if (!staffProfileId) {
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
            .eq("assigned_staff_id", staffProfileId)
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
        .eq("from_staff_id", staffProfileId)
        .order("created_at", { ascending: false });

      if (requestError) {
        console.error("Failed to load requests:", requestError);
        setRequests([]);
      } else {
        setRequests((requestData as RequestRow[]) || []);
      }
    }

    loadStaffData();
  }, [staffProfileId]);

  const selectedShift = useMemo(
    () => publishedShifts.find((shift) => shift.id === selectedShiftId) || null,
    [publishedShifts, selectedShiftId]
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!staffProfileId) {
      alert("Missing staff session.");
      return;
    }

    if (!selectedShiftId) {
      alert("Please select a shift.");
      return;
    }

    if (requestType === "swap" && !toStaffId) {
      alert("Please choose who you want to swap with.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("time_off_requests").insert({
      shift_id: selectedShiftId,
      request_type: requestType,
      from_staff_id: staffProfileId,
      to_staff_id: requestType === "swap" ? toStaffId : null,
      reason: reason.trim() || null,
      status: "pending",
    });

    if (error) {
      console.error("Failed to submit request:", error);
      alert(`Failed to submit request: ${error.message}`);
    } else {
      alert("Request submitted successfully.");
      setSelectedShiftId("");
      setRequestType("leave");
      setToStaffId("");
      setReason("");

      const { data: requestData } = await supabase
        .from("time_off_requests")
        .select("*")
        .eq("from_staff_id", staffProfileId)
        .order("created_at", { ascending: false });

      setRequests((requestData as RequestRow[]) || []);
    }

    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-slate-900">My requests</h1>
        <p className="mt-2 text-sm text-slate-600">
          Submit leave or swap requests for your published shifts.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Submit request</h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Published Shift
                </label>
                <select
                  value={selectedShiftId}
                  onChange={(e) => setSelectedShiftId(e.target.value)}
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
                  Request Type
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as "leave" | "swap")}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                >
                  <option value="leave">Leave</option>
                  <option value="swap">Swap</option>
                </select>
              </div>

              {requestType === "swap" && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Swap With
                  </label>
                  <select
                    value={toStaffId}
                    onChange={(e) => setToStaffId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  >
                    <option value="">Select staff</option>
                    {staffList
                      .filter((staff) => staff.id !== staffProfileId)
                      .map((staff) => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name} · {staff.department}
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
                          {request.request_type === "leave" ? "Leave Request" : "Swap Request"}
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
  );
}