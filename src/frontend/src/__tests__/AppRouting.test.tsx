import App from "@/App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockActor } from "./helpers";

vi.mock("@/backend", () => ({
  createActor: vi.fn(),
  ClassroomDuration: { min30: "min30", hour1: "hour1", hour1half: "hour1half" },
}));

const useActorMock = vi.hoisted(() => vi.fn());
vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: useActorMock,
}));
vi.mock("@caffeineai/object-storage", () => ({
  StorageClient: vi.fn(),
}));

function renderAt(path: string) {
  window.history.pushState({}, "", path);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
}

describe("App routing", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    useActorMock.mockReset();
    const actor = createMockActor();
    actor.listClassrooms.mockResolvedValue([]);
    useActorMock.mockReturnValue({ actor, isFetching: false });
  });

  it("renders the Lobby at the root route", async () => {
    renderAt("/");
    expect(
      await screen.findByRole("heading", { name: "Classroom Lobby" }),
    ).toBeInTheDocument();
  });

  it("renders the sign-in page at the login route", async () => {
    renderAt("/login");
    expect(
      await screen.findByRole("heading", { name: "Welcome to Math Classroom" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Your name")).toBeInTheDocument();
    expect(screen.getByText("Student")).toBeInTheDocument();
    expect(screen.getByText("Teacher")).toBeInTheDocument();
  });

  it("does not expose a room-code join route", async () => {
    renderAt("/join/ABC123");
    // The room-code join flow was removed; the app should not render a
    // room-auth gateway for a /join path.
    expect(
      screen.queryByRole("heading", { name: "Join the classroom" }),
    ).not.toBeInTheDocument();
  });
});
