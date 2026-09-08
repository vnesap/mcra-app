import { HeaderBar } from "@/components/classroom/HeaderBar";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

function renderHeaderBar(role: "teacher" | "student" | null) {
  const props = {
    role,
    roomCode: "ABC123",
    whiteboardOpen: false,
    calculatorOpen: false,
    chatOpen: true,
    onToggleWhiteboard: vi.fn(),
    onToggleCalculator: vi.fn(),
    onToggleChat: vi.fn(),
    onOpenTimer: vi.fn(),
    onOpenRoster: vi.fn(),
    onLeave: vi.fn(),
    onEndSession: vi.fn(),
  };
  render(<HeaderBar {...props} />);
  return props;
}

describe("HeaderBar", () => {
  afterEach(() => cleanup());

  it("disables the End Session button for a student", () => {
    renderHeaderBar("student");

    const endButton = screen.getByRole("button", { name: "End Session" });
    expect(endButton).toBeDisabled();
  });

  it("enables the End Session button for the teacher", () => {
    renderHeaderBar("teacher");

    const endButton = screen.getByRole("button", { name: "End Session" });
    expect(endButton).toBeEnabled();
  });

  it("does not show the Spotlight roster button to a student", () => {
    renderHeaderBar("student");
    expect(screen.queryByRole("button", { name: "Spotlight" })).toBeNull();
  });

  it("shows the Spotlight roster button to the teacher", () => {
    renderHeaderBar("teacher");
    expect(
      screen.getByRole("button", { name: "Spotlight" }),
    ).toBeInTheDocument();
  });

  it("fires onEndSession when the teacher clicks End Session", async () => {
    const props = renderHeaderBar("teacher");
    await userEvent.click(screen.getByRole("button", { name: "End Session" }));
    expect(props.onEndSession).toHaveBeenCalled();
  });

  it("fires onLeave when the Leave button is clicked", async () => {
    const props = renderHeaderBar("student");
    await userEvent.click(screen.getByTestId("classroom.header.leave_button"));
    expect(props.onLeave).toHaveBeenCalled();
  });
});
