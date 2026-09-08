import { RoomAuthGateway } from "@/pages/RoomAuthGateway";
import { useSessionStore } from "@/store/session";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const useParamsMock = vi.hoisted(() => vi.fn());
const useNavigateMock = vi.hoisted(() => vi.fn());
vi.mock("@tanstack/react-router", () => ({
  useParams: useParamsMock,
  useNavigate: useNavigateMock,
}));

describe("RoomAuthGateway", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    useParamsMock.mockReset();
    useNavigateMock.mockReset();
    useSessionStore.getState().clearSession();
  });

  it("shows a role/name modal with the room code", () => {
    useParamsMock.mockReturnValue({ roomCode: "ABC123" });
    useNavigateMock.mockReturnValue(vi.fn());

    render(<RoomAuthGateway />);

    expect(
      screen.getByRole("heading", { name: "Join the classroom" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Room code:/)).toBeInTheDocument();
    expect(screen.getByText("ABC123")).toBeInTheDocument();
    expect(screen.getByText("Teacher")).toBeInTheDocument();
    expect(screen.getByText("Student")).toBeInTheDocument();
  });

  it("requires a name before entering the classroom", async () => {
    useParamsMock.mockReturnValue({ roomCode: "ABC123" });
    useNavigateMock.mockReturnValue(vi.fn());

    render(<RoomAuthGateway />);

    const enterButton = screen.getByRole("button", {
      name: "Enter classroom",
    });
    expect(enterButton).toBeDisabled();

    // The submit button is disabled until a name is provided, so an empty
    // submission cannot proceed.
    await userEvent.click(enterButton);
    expect(
      screen.queryByText("Please enter your name to join the class."),
    ).not.toBeInTheDocument();
  });

  it("stores the chosen role and name and navigates to the classroom", async () => {
    useParamsMock.mockReturnValue({ roomCode: "ABC123" });
    const navigate = vi.fn();
    useNavigateMock.mockReturnValue(navigate);

    render(<RoomAuthGateway />);

    await userEvent.click(screen.getByText("Teacher"));
    await userEvent.type(screen.getByLabelText("Your name"), "Ms. Rivera");
    await userEvent.click(
      screen.getByRole("button", { name: "Enter classroom" }),
    );

    expect(useSessionStore.getState()).toMatchObject({
      role: "teacher",
      name: "Ms. Rivera",
    });
    expect(navigate).toHaveBeenCalledWith({
      to: "/classroom/$roomCode",
      params: { roomCode: "ABC123" },
    });
  });
});
