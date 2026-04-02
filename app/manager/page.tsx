"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Store = {
  id: string;
  name: string;
  open_time: string;
  close_time: string;
};

export default function ManagerPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadStores() {
      const { data, error } = await supabase.from("stores").select("*");

      if (error) {
        console.error("Supabase error:", error);
        setErrorMessage(error.message);
      } else {
        setStores(data || []);
      }

      setLoading(false);
    }

    loadStores();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Manager Dashboard</h1>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Stores</h2>

        {loading && (
          <p className="mt-2 text-sm text-slate-600">Loading stores...</p>
        )}

        {!loading && errorMessage && (
          <p className="mt-2 text-sm text-red-600">Error: {errorMessage}</p>
        )}

        {!loading && !errorMessage && stores.length === 0 && (
          <p className="mt-2 text-sm text-slate-600">No stores found.</p>
        )}

        {!loading && !errorMessage && stores.length > 0 && (
          <ul className="mt-3 space-y-2">
            {stores.map((store) => (
              <li key={store.id} className="rounded-xl bg-slate-50 p-3">
                <p className="font-medium">{store.name}</p>
                <p className="text-sm text-slate-600">
                  {store.open_time} - {store.close_time}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}