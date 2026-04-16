"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Badge, Button, Card, EmptyState, FieldLabel, PageContainer, PageHeader, Select } from "@/components/ui-system";

type StaffProfile = {
  id: string;
  name: string;
  department: "front" | "kitchen";
};

type ShiftRow = {
  id: string;
  shift_date: string;
  department: "front" | "kitchen";
  shift_start: string;
  shift_end: string;
};

type RequestRow = {
  id: string;
  shift_id: string;
  request_type: "leave" | "swap";
  from_staff_id: string;
  to_staff_id: string | null;
  reason: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_at: string | null;
};

export default function ManagerRequestsPage() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [shifts, setShifts] = useState<ShiftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");

  async function loadData() {
    setLoading(true);

    const { data: requestData, error: requestError } = await supabase
      .from("time_off_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (requestError) {
      console.error("Failed to load requests:", requestError);
    } else {
      setRequests((requestData as RequestRow[]) || []);
    }

    const { data: staffData, error: staffError } = await supabase
      .from("staff_profiles")
      .select("id, name, department")
      .order("name", { ascending: true });

    if (staffError) {
      console.error("Failed to load staff:", staffError);
    } else {
      setStaffList((staffData as StaffProfile[]) || []);
    }

    const { data: shiftData, error: shiftError } = await supabase
      .from("scheduled_shifts")
      .select("id, shift_date, department, shift_start, shift_end")
      .order("shift_date", { ascending: true });

    if (shiftError) {
      console.error("Failed to load shifts:", shiftError);
    } else {
      setShifts((shiftData as ShiftRow[]) || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleUpdateStatus(
    requestId: string,
    newStatus: "approved" | "rejected"
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to mark this request as ${newStatus}?`
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("time_off_requests")
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (error) {
      console.error("Failed to update request:", error);
      alert(`Failed to update request: ${error.message}`);
      return;
    }

    await loadData();
  }

  const staffNameMap = useMemo(() => {
    return Object.fromEntries(staffList.map((staff) => [staff.id, staff]));
  }, [staffList]);

  const shiftMap = useMemo(() => {
    return Object.fromEntries(shifts.map((shift) => [shift.id, shift]));
  }, [shifts]);

  const filteredRequests = useMemo(() => {
    if (filterStatus === "all") return requests;
    return requests.filter((request) => request.status === filterStatus);
  }, [requests, filterStatus]);

  return (
    <PageContainer>
        <PageHeader
          title="Requests"
          description="Approve or reject leave and swap requests with full context."
          actions={
            <div className="w-full sm:w-56">
              <FieldLabel>Filter Status</FieldLabel>
              <Select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(
                  e.target.value as "all" | "pending" | "approved" | "rejected"
                )
              }
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              </Select>
            </div>
          }
        />

        <Card>
          {loading ? (
            <p className="text-sm text-slate-600">Loading requests...</p>
          ) : filteredRequests.length === 0 ? (
            <EmptyState>No requests found.</EmptyState>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => {
                const fromStaff = staffNameMap[request.from_staff_id];
                const toStaff = request.to_staff_id
                  ? staffNameMap[request.to_staff_id]
                  : null;
                const shift = shiftMap[request.shift_id];

                return (
                  <div
                    key={request.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                          {request.request_type === "leave"
                            ? "Leave Request"
                            : "Swap Request"}
                        </h2>
                        <p className="mt-1 text-sm text-slate-600">
                          From: {fromStaff?.name || "Unknown"}{" "}
                          {fromStaff ? `(${fromStaff.department})` : ""}
                        </p>

                        {toStaff && (
                          <p className="text-sm text-slate-600">
                            Swap With: {toStaff.name} ({toStaff.department})
                          </p>
                        )}

                        {shift && (
                          <p className="text-sm text-slate-600">
                            Shift: {shift.shift_date} · {shift.department} ·{" "}
                            {shift.shift_start} - {shift.shift_end}
                          </p>
                        )}

                        <p className="text-sm text-slate-500">
                          Submitted: {new Date(request.created_at).toLocaleString()}
                        </p>
                      </div>

                      <span>
                      <Badge
                        tone={
                          request.status === "approved"
                            ? "success"
                            : request.status === "rejected"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {request.status}
                      </Badge>
                      </span>
                    </div>

                    {request.reason && (
                      <div className="mt-4 rounded-2xl bg-white p-4">
                        <p className="text-sm font-medium text-slate-800">Reason</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {request.reason}
                        </p>
                      </div>
                    )}

                    {request.status === "pending" && (
                      <div className="mt-4 flex gap-3">
                        <Button
                          type="button"
                          onClick={() => handleUpdateStatus(request.id, "approved")}
                          variant="success"
                        >
                          Approve
                        </Button>

                        <Button
                          type="button"
                          onClick={() => handleUpdateStatus(request.id, "rejected")}
                          variant="danger"
                        >
                          Reject
                        </Button>
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