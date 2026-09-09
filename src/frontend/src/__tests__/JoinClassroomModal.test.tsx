import { ClassroomRow } from "@/components/ClassroomRow";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
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

const useNavigateMock = vi.hoisted(() => vi.fn());
vi.mock("@tanstack/react-router", () => ({
  useNavigate: useNavigateMock,
}));

function renderRow(classroom = sampleClassroom()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ClassroomRow classroom={classroom} />
    </QueryClientProvider>,
  );
}

describe("ClassroomRow share room link", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    useActorMock.mockReset();
    useNavigateMock.mockReset();
    useNavigateMock.mockReturnValue(vi.fn());
    const actor = createMockActor();
    actor.getOnline.mockResolvedValue([]);
    useActorMock.mockReturnValue({ actor, isFetching: false });
  });

  it("copies a classroom link that lands on the classroom page", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    renderRow(sampleClassroom({ roomCode: "ABC123" }));

    await userEvent.click(
      screen.getByRole("button", { name: "Share Room Link" }),
    );

    expect(writeText).toHaveBeenCalledWith(
      `${window.location.origin}/classroom/ABC123`,
    );
  });
});
