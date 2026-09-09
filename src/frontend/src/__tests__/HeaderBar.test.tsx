import { HeaderBar } from "@/components/classroom/HeaderBar";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

function renderHeaderBar(
  role: "teacher" | "student" | null,
  overrides: Partial<{
    canDownload: boolean;
    uploading: boolean;
    onUploadFile: (file: File) => void;
    onDownloadFile: () => void;
  }> = {},
) {
  const props = {
    role,
    roomCode: "ABC123",
    whiteboardOpen: false,
    calculatorOpen: false,
    chatOpen: true,
    canDownload: false,
    uploading: false,
    onToggleWhiteboard: vi.fn(),
    onToggleCalculator: vi.fn(),
    onToggleChat: vi.fn(),
    onOpenTimer: vi.fn(),
    onOpenRoster: vi.fn(),
    onUploadFile: vi.fn(),
    onDownloadFile: vi.fn(),
    onLeave: vi.fn(),
    onEndSession: vi.fn(),
    ...overrides,
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

  it("renders the whiteboard and calculator toggles for every role", () => {
    renderHeaderBar("student");
    expect(
      screen.getByTestId("classroom.header.whiteboard_toggle"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("classroom.header.calculator_toggle"),
    ).toBeInTheDocument();
  });

  it("fires onToggleCalculator when the calculator toggle is clicked", () => {
    const props = renderHeaderBar("teacher");
    // The calculator toggle is wrapped in a Radix Tooltip; use a synchronous
    // fireEvent click so the assertion is not subject to user-event's async
    // pointer timing, which has proven flaky here.
    fireEvent.click(screen.getByTestId("classroom.header.calculator_toggle"));
    expect(props.onToggleCalculator).toHaveBeenCalled();
  });

  it("renders the upload and download buttons next to the calculator", () => {
    renderHeaderBar("student");
    expect(
      screen.getByTestId("classroom.header.upload_button"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("classroom.header.download_button"),
    ).toBeInTheDocument();
  });

  it("disables the download button when no file has been uploaded", () => {
    renderHeaderBar("student", { canDownload: false });
    expect(
      screen.getByTestId("classroom.header.download_button"),
    ).toBeDisabled();
  });

  it("enables the download button and fires onDownloadFile when a file is available", async () => {
    const props = renderHeaderBar("student", { canDownload: true });
    const download = screen.getByTestId("classroom.header.download_button");
    expect(download).toBeEnabled();
    await userEvent.click(download);
    expect(props.onDownloadFile).toHaveBeenCalled();
  });

  it("fires onUploadFile with the picked file", async () => {
    const onUploadFile = vi.fn();
    renderHeaderBar("student", { onUploadFile });
    const file = new File(["hello"], "notes.txt", { type: "text/plain" });
    await userEvent.upload(
      screen.getByTestId("classroom.header.upload_input"),
      file,
    );
    expect(onUploadFile).toHaveBeenCalledWith(file);
  });

  it("disables the upload button while a file is uploading", () => {
    renderHeaderBar("student", { uploading: true });
    expect(screen.getByTestId("classroom.header.upload_button")).toBeDisabled();
  });
});
