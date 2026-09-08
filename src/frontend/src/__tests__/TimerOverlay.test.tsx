import { TimerOverlay } from "@/components/classroom/TimerOverlay";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useTimerMock = vi.hoisted(() => vi.fn());
const useSetTimerMock = vi.hoisted(() => vi.fn());
vi.mock("@/hooks/useTimer", () => ({
  useTimer: useTimerMock,
  useSetTimer: useSetTimerMock,
}));

const speakMock = vi.hoisted(() => vi.fn());

class SpeechSynthesisUtteranceMock {
  text: string;
  rate = 1;
  constructor(text: string) {
    this.text = text;
  }
}

function timerState(remainingSec: number, running = true) {
  const nowNs = BigInt(Date.now()) * 1_000_000n;
  return {
    startTime: nowNs,
    durationSec: BigInt(remainingSec),
    running,
  };
}

describe("TimerOverlay", () => {
  beforeEach(() => {
    useTimerMock.mockReset();
    useSetTimerMock.mockReset();
    useSetTimerMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
    speakMock.mockReset();
    Object.defineProperty(window, "speechSynthesis", {
      value: { speak: speakMock },
      configurable: true,
    });
    (globalThis as Record<string, unknown>).SpeechSynthesisUtterance =
      SpeechSynthesisUtteranceMock;
  });

  it("stays hidden while the timer has more than 3 seconds left", () => {
    useTimerMock.mockReturnValue({ data: timerState(60) });
    render(<TimerOverlay open={false} onClose={vi.fn()} isTeacher={false} />);
    expect(screen.queryByTestId("classroom.timer.countdown")).toBeNull();
  });

  it("flashes the countdown into view in the final 3 seconds", () => {
    useTimerMock.mockReturnValue({ data: timerState(2) });
    render(<TimerOverlay open={false} onClose={vi.fn()} isTeacher={false} />);
    expect(screen.getByTestId("classroom.timer.countdown")).toBeInTheDocument();
    expect(screen.getByText("seconds left!")).toBeInTheDocument();
  });

  it("plays a text-to-speech 'Time is up!' alert when the timer hits zero", () => {
    useTimerMock.mockReturnValue({ data: timerState(0) });
    render(<TimerOverlay open={false} onClose={vi.fn()} isTeacher={false} />);
    expect(speakMock).toHaveBeenCalledTimes(1);
    const utterance = speakMock.mock.calls[0][0];
    expect(utterance.text).toBe("Time is up!");
  });

  it("shows the teacher-only Set timer button when no timer is running", () => {
    useTimerMock.mockReturnValue({ data: timerState(0, false) });
    render(<TimerOverlay open={false} onClose={vi.fn()} isTeacher />);
    expect(
      screen.getByRole("button", { name: "Set timer" }),
    ).toBeInTheDocument();
  });
});
