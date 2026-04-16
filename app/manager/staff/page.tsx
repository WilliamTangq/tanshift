"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Badge, Button, Card, FieldLabel, Input, PageContainer, PageHeader, Select } from "@/components/ui-system";

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
    <PageContainer>
        <PageHeader
          title="Staff Management"
          description="Add staff members and maintain department, skill, and priority attributes."
        />

        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          <Card title="Add Staff" subtitle="Create new active team profiles.">

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <FieldLabel>Name</FieldLabel>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter staff name"
                />
              </div>

              <div>
                <FieldLabel>Store</FieldLabel>
                <Select
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                >
                  <option value="">Select a store</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <FieldLabel>Department</FieldLabel>
                <Select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as "front" | "kitchen")}
                >
                  <option value="front">Front</option>
                  <option value="kitchen">Kitchen</option>
                </Select>
              </div>

              <div>
                <FieldLabel>Skill Level</FieldLabel>
                <Select
                  value={skillLevel}
                  onChange={(e) =>
                    setSkillLevel(e.target.value as "all_rounder" | "normal")
                  }
                >
                  <option value="normal">Normal</option>
                  <option value="all_rounder">All-Rounder</option>
                </Select>
              </div>

              <div>
                <FieldLabel>Priority Level</FieldLabel>
                <Select
                  value={priorityLevel}
                  onChange={(e) =>
                    setPriorityLevel(e.target.value as "high" | "medium" | "low")
                  }
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="w-full"
              >
                {saving ? "Saving..." : "Add Staff"}
              </Button>
            </form>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Team Members</h2>
              <Badge>{staff.length} staff</Badge>
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
                        <td className="px-4 py-3 text-slate-600">{member.department}</td>
                        <td className="px-4 py-3 text-slate-600">{member.skill_level}</td>
                        <td className="px-4 py-3 text-slate-600">{member.priority_level}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
    </PageContainer>
  );
}