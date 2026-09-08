import { ChatSidebar } from "@/components/classroom/ChatSidebar";
import { useSessionStore } from "@/store/session";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const useChatMessagesMock = vi.hoisted(() => vi.fn());
const useSendChatMessageMock = vi.hoisted(() => vi.fn());
const useSendReactionMock = vi.hoisted(() => vi.fn());
vi.mock("@/hooks/useChat", () => ({
  useChatMessages: useChatMessagesMock,
  useSendChatMessage: useSendChatMessageMock,
  useSendReaction: useSendReactionMock,
}));
vi.mock("@caffeineai/core-infrastructure", () => ({
  loadConfig: vi.fn(),
  useActor: vi.fn(),
}));
vi.mock("@caffeineai/object-storage", () => ({
  StorageClient: vi.fn(),
}));

// jsdom does not implement Element.prototype.scrollTo, which ChatSidebar's
// auto-scroll effect calls whenever messages are present.
if (typeof Element !== "undefined" && !Element.prototype.scrollTo) {
  Element.prototype.scrollTo =
    vi.fn() as unknown as typeof Element.prototype.scrollTo;
}

function renderChat() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ChatSidebar onClose={vi.fn()} />
    </QueryClientProvider>,
  );
}

describe("ChatSidebar", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    useChatMessagesMock.mockReset();
    useSendChatMessageMock.mockReset();
    useSendReactionMock.mockReset();
    useSessionStore.getState().clearSession();
    useSessionStore.getState().setSession({ role: "student", name: "Maya" });
  });

  it("shows an empty state when there are no messages", () => {
    useChatMessagesMock.mockReturnValue({ data: [] });
    useSendChatMessageMock.mockReturnValue({ mutate: vi.fn() });
    useSendReactionMock.mockReturnValue({ mutate: vi.fn() });

    renderChat();
    expect(
      screen.getByText("No messages yet. Say hello to the class!"),
    ).toBeInTheDocument();
  });

  it("sends a chat message through the composer", async () => {
    useChatMessagesMock.mockReturnValue({ data: [] });
    const sendMutate = vi.fn();
    useSendChatMessageMock.mockReturnValue({ mutate: sendMutate });
    useSendReactionMock.mockReturnValue({ mutate: vi.fn() });

    renderChat();
    await userEvent.type(
      screen.getByPlaceholderText("Type a message…"),
      "Hello class",
    );
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(sendMutate).toHaveBeenCalledWith(
      { text: "Hello class", file: null },
      expect.any(Object),
    );
  });

  it("sends a reaction emoji from the grid", async () => {
    useChatMessagesMock.mockReturnValue({ data: [] });
    useSendChatMessageMock.mockReturnValue({ mutate: vi.fn() });
    const reactionMutate = vi.fn();
    useSendReactionMock.mockReturnValue({ mutate: reactionMutate });

    renderChat();
    await userEvent.click(
      screen.getByRole("button", { name: "Send reaction 👍" }),
    );
    expect(reactionMutate).toHaveBeenCalledWith("👍");
  });

  it("sends a worded sticker", async () => {
    useChatMessagesMock.mockReturnValue({ data: [] });
    useSendChatMessageMock.mockReturnValue({ mutate: vi.fn() });
    const reactionMutate = vi.fn();
    useSendReactionMock.mockReturnValue({ mutate: reactionMutate });

    renderChat();
    await userEvent.click(screen.getByRole("button", { name: "Great job!" }));
    expect(reactionMutate).toHaveBeenCalledWith("Great job!");
  });

  it("renders an incoming chat message with the sender name", () => {
    useChatMessagesMock.mockReturnValue({
      data: [
        {
          id: 1n,
          senderName: "Ms. Rivera",
          text: "Welcome!",
          isSystem: false,
          timestamp: 1_700_000_000_000_000_000n,
        },
      ],
    });
    useSendChatMessageMock.mockReturnValue({ mutate: vi.fn() });
    useSendReactionMock.mockReturnValue({ mutate: vi.fn() });

    renderChat();
    expect(screen.getByText("Welcome!")).toBeInTheDocument();
    expect(screen.getByText("Ms. Rivera")).toBeInTheDocument();
  });
});
