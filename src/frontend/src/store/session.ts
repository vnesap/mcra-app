import type { SessionRole, SessionUser } from "@/lib/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SessionState {
  role: SessionRole | null;
  name: string;
  setRole: (role: SessionRole) => void;
  setName: (name: string) => void;
  setSession: (user: SessionUser) => void;
  clearSession: () => void;
}

/**
 * Session-scoped identity for the current participant. Role and name persist
 * for the session via localStorage so they survive a page reload while the
 * user is in a live classroom.
 */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      role: null,
      name: "",
      setRole: (role) => set({ role }),
      setName: (name) => set({ name }),
      setSession: (user) => set({ role: user.role, name: user.name }),
      clearSession: () => set({ role: null, name: "" }),
    }),
    {
      name: "math-classroom-session",
    },
  ),
);
