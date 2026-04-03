"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "tanshift_session_v1";

export type UserRole = "manager" | "staff";

export type SessionState = {
  role: UserRole | null;
  staffProfileId: string | null;
  staffName: string | null;
};

type SessionContextValue = SessionState & {
  hydrated: boolean;
  signInManager: () => void;
  signInStaff: (staffProfileId: string, staffName: string) => void;
  signOut: () => void;
};

const emptySession: SessionState = {
  role: null,
  staffProfileId: null,
  staffName: null,
};

const SessionContext = createContext<SessionContextValue | null>(null);

function readStoredSession(): SessionState {
  if (typeof window === "undefined") return emptySession;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptySession;
    const parsed = JSON.parse(raw) as Partial<SessionState>;
    if (parsed.role === "manager") {
      return { role: "manager", staffProfileId: null, staffName: null };
    }
    if (parsed.role === "staff" && typeof parsed.staffProfileId === "string") {
      return {
        role: "staff",
        staffProfileId: parsed.staffProfileId,
        staffName: typeof parsed.staffName === "string" ? parsed.staffName : null,
      };
    }
  } catch {
    /* ignore */
  }
  return emptySession;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<SessionState>(emptySession);

  useEffect(() => {
    setState(readStoredSession());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: SessionState) => {
    setState(next);
    if (typeof window === "undefined") return;
    if (!next.role) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const signInManager = useCallback(() => {
    persist({ role: "manager", staffProfileId: null, staffName: null });
  }, [persist]);

  const signInStaff = useCallback(
    (staffProfileId: string, staffName: string) => {
      persist({
        role: "staff",
        staffProfileId,
        staffName,
      });
    },
    [persist]
  );

  const signOut = useCallback(() => {
    persist(emptySession);
  }, [persist]);

  const value = useMemo<SessionContextValue>(
    () => ({
      ...state,
      hydrated,
      signInManager,
      signInStaff,
      signOut,
    }),
    [state, hydrated, signInManager, signInStaff, signOut]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx;
}
