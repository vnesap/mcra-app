import { Whiteboard } from "@/components/classroom/Whiteboard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockActor } from "./helpers";

vi.mock("@/backend", () => ({
  createActor: vi.fn(),
}));

const useActorMock = vi.hoisted(() => vi.fn());
vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: useActorMock,
}));

function renderWhiteboard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <Whiteboard onClose={vi.fn()} />
    </QueryClientProvider>,
  );
}

describe("Whiteboard", () => {
  beforeEach(() => {
    useActorMock.mockReset();
    const actor = createMockActor();
    actor.listWhiteboardActions.mockResolvedValue([]);
    useActorMock.mockReturnValue({ actor, isFetching: false });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the whiteboard toolbar with drawing tools and the Screenshot button", () => {
    renderWhiteboard();
    expect(screen.getByText("Whiteboard")).toBeInTheDocument();
    expect(
      screen.getByTestId("classroom.whiteboard.screenshot_button"),
    ).toBeInTheDocument();
    // Pen and Erase are rendered as tabs.
    expect(screen.getByRole("tab", { name: "Pen" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Erase" })).toBeInTheDocument();
  });

  it("downloads the rendered drawing when Screenshot is clicked", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
      "data:image/png;base64,AAAA",
    );
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    renderWhiteboard();
    await userEvent.click(
      screen.getByTestId("classroom.whiteboard.screenshot_button"),
    );

    expect(clickSpy).toHaveBeenCalledTimes(1);
    clickSpy.mockRestore();
  });

  it("toggles between full and half screen", async () => {
    renderWhiteboard();
    const toggle = screen.getByTestId("classroom.whiteboard.fullscreen_toggle");
    await userEvent.click(toggle);
    expect(
      screen.getByTestId("classroom.whiteboard.fullscreen_toggle"),
    ).toHaveAttribute("aria-label", "Half screen");
  });

  it("renders the color palette and stroke width slider alongside the tools", () => {
    renderWhiteboard();
    // The color palette exposes one button per color.
    const colorButtons = screen.getAllByTestId(
      "classroom.whiteboard.color_button",
    );
    expect(colorButtons.length).toBeGreaterThan(0);
    // The stroke width slider is present.
    expect(
      screen.getByTestId("classroom.whiteboard.width_slider"),
    ).toBeInTheDocument();
  });

  it("offers rectangle, circle, line, and arrow shape tools", () => {
    renderWhiteboard();
    expect(
      screen.getByRole("button", { name: "rect tool" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "circle tool" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "line tool" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "arrow tool" }),
    ).toBeInTheDocument();
  });

  it("selects a shape tool and marks it pressed", async () => {
    renderWhiteboard();
    const rect = screen.getByRole("button", { name: "rect tool" });
    expect(rect).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(rect);
    expect(rect).toHaveAttribute("aria-pressed", "true");
  });
});
