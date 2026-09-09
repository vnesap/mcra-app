import { LoginPage } from "@/pages/LoginPage";
import { useSessionStore } from "@/store/session";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/backend", () => ({
  createActor: vi.fn(),
  ClassroomDuration: { min30: "min30", hour1: "hour1", hour1half: "hour1half" },
}));

const useNavigateMock = vi.hoisted(() => vi.fn());
vi.mock("@tanstack/react-router", () => ({
  useNavigate: useNavigateMock,
}));

function renderLogin() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <LoginPage />
    </QueryClientProvider>,
  );
}

describe("LoginPage", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    useNavigateMock.mockReset();
    useSessionStore.getState().clearSession();
    useNavigateMock.mockReturnValue(vi.fn());
  });

  it("renders the sign-in form without a blank screen", () => {
    renderLogin();

    expect(
      screen.getByRole("heading", { name: "Welcome to Math Classroom" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Your name")).toBeInTheDocument();
    expect(screen.getByText("Student")).toBeInTheDocument();
    expect(screen.getByText("Teacher")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Enter the Lobby" }),
    ).toBeInTheDocument();
  });

  it("does not collect an email or password", () => {
    renderLogin();

    expect(screen.queryByLabelText("Email address")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Sign in with Internet Identity" }),
    ).not.toBeInTheDocument();
  });

  it("shows an inline error for an empty name and does not sign in", async () => {
    renderLogin();
    await userEvent.click(
      screen.getByRole("button", { name: "Enter the Lobby" }),
    );

    expect(screen.getByText("Please enter your name.")).toBeInTheDocument();
    expect(useSessionStore.getState().role).toBeNull();
  });

  it("shows an inline error for a name that is too short", async () => {
    renderLogin();
    await userEvent.type(screen.getByLabelText("Your name"), "A");
    await userEvent.click(
      screen.getByRole("button", { name: "Enter the Lobby" }),
    );

    expect(
      screen.getByText("Your name should be at least 2 characters."),
    ).toBeInTheDocument();
    expect(useSessionStore.getState().role).toBeNull();
  });

  it("signs in with a name and role, stores the session, and routes to the Lobby", async () => {
    const navigate = vi.fn();
    useNavigateMock.mockReturnValue(navigate);

    renderLogin();
    await userEvent.type(screen.getByLabelText("Your name"), "Ms. Rivera");
    await userEvent.click(screen.getByText("Teacher"));
    await userEvent.click(
      screen.getByRole("button", { name: "Enter the Lobby" }),
    );

    expect(useSessionStore.getState()).toMatchObject({
      role: "teacher",
      name: "Ms. Rivera",
    });
    expect(navigate).toHaveBeenCalledWith({ to: "/" });
  });

  it("signs in as a student by default", async () => {
    const navigate = vi.fn();
    useNavigateMock.mockReturnValue(navigate);

    renderLogin();
    await userEvent.type(screen.getByLabelText("Your name"), "Maya");
    await userEvent.click(
      screen.getByRole("button", { name: "Enter the Lobby" }),
    );

    expect(useSessionStore.getState()).toMatchObject({
      role: "student",
      name: "Maya",
    });
    expect(navigate).toHaveBeenCalledWith({ to: "/" });
  });

  it("redirects a signed-in user away from the login page to the Lobby", () => {
    const navigate = vi.fn();
    useNavigateMock.mockReturnValue(navigate);
    useSessionStore.getState().setSession({ role: "student", name: "Alex" });

    renderLogin();

    expect(navigate).toHaveBeenCalledWith({ to: "/" });
  });
});
