import { useSessionStore } from "@/store/session";
import { beforeEach, describe, expect, it } from "vitest";

describe("session store", () => {
  beforeEach(() => {
    useSessionStore.getState().clearSession();
  });

  it("starts with no role or name", () => {
    expect(useSessionStore.getState().role).toBeNull();
    expect(useSessionStore.getState().name).toBe("");
  });

  it("sets a full session with role and name", () => {
    useSessionStore
      .getState()
      .setSession({ role: "teacher", name: "Ms. Rivera" });
    expect(useSessionStore.getState()).toMatchObject({
      role: "teacher",
      name: "Ms. Rivera",
    });
  });

  it("clears the session", () => {
    useSessionStore.getState().setSession({ role: "student", name: "Maya" });
    useSessionStore.getState().clearSession();
    expect(useSessionStore.getState().role).toBeNull();
    expect(useSessionStore.getState().name).toBe("");
  });
});
