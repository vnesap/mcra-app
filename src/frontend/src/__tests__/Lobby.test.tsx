import { Lobby } from "@/pages/Lobby";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockActor, sampleClassroom } from "./helpers";

vi.mock("@/backend", () => ({
  createActor: vi.fn(),
  ClassroomDuration: { min30: "min30", hour1: "hour1", hour1half: "hour1half" },
}));

const useActorMock = vi.hoisted(() => vi.fn());
vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: useActorMock,
}));

function renderLobby() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <Lobby />
    </QueryClientProvider>,
  );
}

describe("Lobby", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    useActorMock.mockReset();
  });

  it("renders the lobby header and scheduler without a blank screen", () => {
    const actor = createMockActor();
    actor.listClassrooms.mockResolvedValue([]);
    useActorMock.mockReturnValue({ actor, isFetching: false });

    renderLobby();

    expect(
      screen.getByRole("heading", { name: "Classroom Lobby" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Schedule a classroom" }),
    ).toBeInTheDocument();
  });

  it("shows an empty state when no classrooms exist", async () => {
    const actor = createMockActor();
    actor.listClassrooms.mockResolvedValue([]);
    useActorMock.mockReturnValue({ actor, isFetching: false });

    renderLobby();

    expect(await screen.findByText("No classrooms yet")).toBeInTheDocument();
  });

  it("lists scheduled classrooms in chronological rows", async () => {
    const actor = createMockActor();
    actor.listClassrooms.mockResolvedValue([
      sampleClassroom({ id: 1n, title: "Adding Up Fun", roomCode: "AAA" }),
      sampleClassroom({ id: 2n, title: "Fractions", roomCode: "BBB" }),
    ]);
    useActorMock.mockReturnValue({ actor, isFetching: false });

    renderLobby();

    expect(await screen.findByText("Adding Up Fun")).toBeInTheDocument();
    expect(screen.getByText("Fractions")).toBeInTheDocument();
  });

  it("filters the room list by keyword via the search bar", async () => {
    const actor = createMockActor();
    actor.listClassrooms.mockResolvedValue([
      sampleClassroom({ id: 1n, title: "Adding Up Fun", roomCode: "AAA" }),
      sampleClassroom({ id: 2n, title: "Fractions", roomCode: "BBB" }),
    ]);
    actor.searchClassrooms.mockResolvedValue([
      sampleClassroom({ id: 1n, title: "Adding Up Fun", roomCode: "AAA" }),
    ]);
    useActorMock.mockReturnValue({ actor, isFetching: false });

    renderLobby();
    await screen.findByText("Adding Up Fun");

    await userEvent.type(
      screen.getByLabelText("Search classrooms by keyword"),
      "Adding",
    );

    await waitFor(() => {
      expect(actor.searchClassrooms).toHaveBeenCalledWith("Adding", null);
    });
    expect(await screen.findByText("Adding Up Fun")).toBeInTheDocument();
    expect(screen.queryByText("Fractions")).not.toBeInTheDocument();
  });

  it("schedules a classroom through the teacher panel", async () => {
    const actor = createMockActor();
    actor.listClassrooms.mockResolvedValue([]);
    actor.createClassroom.mockResolvedValue(
      sampleClassroom({ id: 1n, title: "New Room" }),
    );
    useActorMock.mockReturnValue({ actor, isFetching: false });

    renderLobby();

    await userEvent.type(screen.getByLabelText("Classroom title"), "New Room");
    await userEvent.click(screen.getByRole("button", { name: "Create room" }));

    await waitFor(() => {
      expect(actor.createClassroom).toHaveBeenCalledWith("New Room", "min30");
    });
  });
});
