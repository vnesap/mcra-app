import type { SessionUser } from "@/lib/types";
import { useSessionStore } from "@/store/session";

/**
 * Name + role sign-in. Sets the local session identity — no email or password
 * required — so the participant can browse the lobby and join a classroom.
 */
export function useSignIn() {
  const setSession = useSessionStore((s) => s.setSession);
  return setSession;
}
