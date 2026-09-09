import { LiveClassroom } from "@/pages/LiveClassroom";
import { useSessionStore } from "@/store/session";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockActor } from "./helpers";

vi.mock("@/backend", () => ({
  createActor: vi.fn(),
  ClassroomDuration: { min30: "min30", hour1: "hour1", hour1half: "hour1half" },
}));

const useActorMock = vi.hoisted(() => vi.fn());
vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: useActorMock,
  loadConfig: vi.fn(),
}));
vi.mock("@caffeineai/object-storage", () => ({
  StorageClient: vi.fn(),
}));

const useChatMessagesMock = vi.hoisted(() => vi.fn());
const useSendChatMessageMock = vi.hoisted(() => vi.fn());
const useSendReactionMock = vi.hoisted(() => vi.fn());
const useReactionsMock = vi.hoisted(() => vi.fn());
vi.mock("@/hooks/useChat", () => ({
  useChatMessages: useChatMessagesMock,
  useSendChatMessage: useSendChatMessageMock,
  useSendReaction: useSendReactionMock,
  useReactions: useReactionsMock,
}));

const useParamsMock = vi.hoisted(() => vi.fn());
const useNavigateMock = vi.hoisted(() => vi.fn());
vi.mock("@tanstack/react-router", () => ({
  useParams: useParamsMock,
  useNavigate: useNavigateMock,
}));

// jsdom does not implement Element.prototype.scrollTo, which ChatSidebar's
// auto-scroll effect calls whenever messages are present.
if (typeof Element !== "undefined" && !Element.prototype.scrollTo) {
  Element.prototype.scrollTo =
    vi.fn() as unknown as typeof Element.prototype.scrollTo;
}

function renderClassroom() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <LiveClassroom />
    </QueryClientProvider>,
  );
}

describe("LiveClassroom", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    useActorMock.mockReset();
    useChatMessagesMock.mockReset();
    useSendChatMessageMock.mockReset();
    useSendReactionMock.mockReset();
    useReactionsMock.mockReset();
    useParamsMock.mockReset();
    useNavigateMock.mockReset();
    useSessionStore.getState().clearSession();
    useSessionStore.getState().setSession({ role: "student", name: "Maya" });

    useParamsMock.mockReturnValue({ roomCode: "ABC123" });
    useNavigateMock.mockReturnValue(vi.fn());
    useChatMessagesMock.mockReturnValue({ data: [] });
    useSendChatMessageMock.mockReturnValue({ mutate: vi.fn() });
    useSendReactionMock.mockReturnValue({ mutate: vi.fn() });
    useReactionsMock.mockReturnValue({ data: [] });

    const actor = createMockActor();
    actor.getOnline.mockResolvedValue([]);
    actor.getSpotlight.mockResolvedValue({ active: false, studentName: "" });
    actor.getSticker.mockResolvedValue({ studentName: "", symbol: "" });
    actor.getSessionEnded.mockResolvedValue(false);
    actor.joinRoom.mockResolvedValue(null);
    actor.leaveRoom.mockResolvedValue(null);
    useActorMock.mockReturnValue({ actor, isFetching: false });

    // VideoLayout requests the local camera on mount; jsdom has no mediaDevices.
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        getUserMedia: vi.fn().mockRejectedValue(new Error("no camera")),
      },
      configurable: true,
    });
  });

  it("renders the classroom header, video layout, and chat sidebar", () => {
    renderClassroom();

    expect(screen.getByText("Live Classroom")).toBeInTheDocument();
    expect(screen.getByText("Room ABC123")).toBeInTheDocument();
    // Video layout shows the teacher feed window.
    expect(
      screen.getByTestId("classroom.video.teacher_window"),
    ).toBeInTheDocument();
    // Chat sidebar is open by default.
    expect(screen.getByPlaceholderText("Type a message…")).toBeInTheDocument();
  });

  it("opens the whiteboard from the header toggle", async () => {
    renderClassroom();

    expect(
      screen.queryByTestId("classroom.whiteboard.screenshot_button"),
    ).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByTestId("classroom.header.whiteboard_toggle"),
    );
    expect(
      screen.getByTestId("classroom.whiteboard.screenshot_button"),
    ).toBeInTheDocument();
  });

  it("toggles the chat sidebar closed and back open", async () => {
    renderClassroom();

    expect(screen.getByPlaceholderText("Type a message…")).toBeInTheDocument();
    await userEvent.click(screen.getByTestId("classroom.header.chat_toggle"));
    expect(
      screen.queryByPlaceholderText("Type a message…"),
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByTestId("classroom.header.chat_toggle"));
    expect(screen.getByPlaceholderText("Type a message…")).toBeInTheDocument();
  });
});
