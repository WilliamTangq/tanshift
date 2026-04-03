"use client";

import { FormEvent, useEffect, useState } from "react";
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
  active: boolean;
  store_id: string;
};

export default function StaffManagementPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [department, setDepartment] = useState<"front" | "kitchen">("front");
  const [skillLevel, setSkillLevel] = useState<"all_rounder" | "normal">("normal");
  const [priorityLevel, setPriorityLevel] = useState<"high" | "medium" | "low">("medium");
  const [storeId, setStoreId] = useState("");

  async function loadData() {
    setLoading(true);

    const { data: storeData, error: storeError } = await supabase
      .from("stores")
      .select("id, name")
      .order("created_at", { ascending: true });

    if (storeError) {
      console.error("Failed to load stores:", storeError);
    } else {
      setStores(storeData || []);
      if ((storeData || []).length > 0 && !storeId) {
        setStoreId(storeData![0].id);
      }
    }

    const { data: staffData, error: staffError } = await supabase
      .from("staff_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (staffError) {
      console.error("Failed to load staff:", staffError);
    } else {
      setStaff((staffData as StaffProfile[]) || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter a staff name.");
      return;
    }

    if (!storeId) {
      alert("Please select a store.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("staff_profiles").insert({
      name: name.trim(),
      department: department,
      skill_level: skillLevel,
      priority_level: priorityLevel,
      active: true,
      store_id: storeId,
      user_id: null,
    });

    if (error) {
      console.error("Failed to create staff:", error);
      alert(`Failed to create staff: ${error.message}`);
    } else {
      setName("");
      setDepartment("front");
      setSkillLevel("normal");
      setPriorityLevel("medium");
      await loadData();
    }

    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
        <p className="mt-2 text-sm text-slate-600">
          Add staff members for TanShift and manage your team list.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Add Staff</h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter staff name"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Store
                </label>
                <select
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                >
                  <option value="">Select a store</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as "front" | "kitchen")}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                >
                  <option value="front">Front</option>
                  <option value="kitchen">Kitchen</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Skill Level
                </label>
                <select
                  value={skillLevel}
                  onChange={(e) =>
                    setSkillLevel(e.target.value as "all_rounder" | "normal")
                  }
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                >
                  <option value="normal">Normal</option>
                  <option value="all_rounder">All-Rounder</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Priority Level
                </label>
                <select
                  value={priorityLevel}
                  onChange={(e) =>
                    setPriorityLevel(e.target.value as "high" | "medium" | "low")
                  }
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Add Staff"}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Team Members</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {staff.length} staff
              </span>
            </div>

            {loading ? (
              <p className="mt-4 text-sm text-slate-600">Loading staff...</p>
            ) : staff.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">
                No staff added yet.
              </p>
            ) : (
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">
                        Department
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">
                        Skill
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">
                        Priority
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {staff.map((member) => (
                      <tr key={member.id}>
                        <td className="px-4 py-3 text-slate-900">{member.name}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {member.department}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {member.skill_level}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {member.priority_level}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}