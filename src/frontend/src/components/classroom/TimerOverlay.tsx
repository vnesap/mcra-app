import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSetTimer, useTimer } from "@/hooks/useTimer";
import { Timer as TimerIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface TimerOverlayProps {
  open: boolean;
  onClose: () => void;
  isTeacher: boolean;
}

/** Compute remaining seconds from the backend timer state. */
function remainingSeconds(
  startTime: bigint,
  durationSec: bigint,
  running: boolean,
): number {
  if (!running) return 0;
  const now = BigInt(Date.now()) * 1_000_000n;
  const end = startTime + durationSec * 1_000_000_000n;
  const remaining = Number((end - now) / 1_000_000_000n);
  return Math.max(0, Math.ceil(remaining));
}

/**
 * Countdown timer configured by the teacher and synced to all users. Runs
 * silently and hidden until the final 3 seconds flash into view, then plays a
 * text-to-speech "Time is up!" alert.
 */
export function TimerOverlay({ open, isTeacher }: TimerOverlayProps) {
  const { data: timer } = useTimer();
  const setTimer = useSetTimer();

  const [minutes, setMinutes] = useState("5");
  const [seconds, setSeconds] = useState("0");
  const [showConfig, setShowConfig] = useState(false);
  const announcedRef = useRef(false);

  const remaining = timer
    ? remainingSeconds(timer.startTime, timer.durationSec, timer.running)
    : 0;

  const isRunning = timer?.running ?? false;
  const inFinalCountdown = isRunning && remaining > 0 && remaining <= 3;

  // Reset the TTS guard when a new timer starts.
  useEffect(() => {
    if (isRunning && remaining > 3) {
      announcedRef.current = false;
    }
  }, [isRunning, remaining]);

  // Play the "Time is up!" alert once when the timer hits zero.
  useEffect(() => {
    if (isRunning && remaining === 0 && !announcedRef.current) {
      announcedRef.current = true;
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance("Time is up!");
        utterance.rate = 1;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [isRunning, remaining]);

  function handleSetTimer() {
    const total =
      (Number.parseInt(minutes, 10) || 0) * 60 +
      (Number.parseInt(seconds, 10) || 0);
    if (total <= 0) return;
    setTimer.mutate(BigInt(total));
    setShowConfig(false);
  }

  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <>
      {/* Config modal (teacher) */}
      <Dialog open={open && showConfig} onOpenChange={(v) => setShowConfig(v)}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TimerIcon className="size-5" /> Set lesson timer
            </DialogTitle>
            <DialogDescription>
              Choose how long the countdown should run. It stays hidden until
              the final 3 seconds.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="timer-minutes">Minutes</Label>
              <Input
                id="timer-minutes"
                type="number"
                min={0}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                data-ocid="classroom.timer.minutes_input"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timer-seconds">Seconds</Label>
              <Input
                id="timer-seconds"
                type="number"
                min={0}
                max={59}
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                data-ocid="classroom.timer.seconds_input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfig(false)}
              data-ocid="classroom.timer.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSetTimer}
              disabled={setTimer.isPending}
              data-ocid="classroom.timer.start_button"
            >
              Start timer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating countdown — only visible in the final 3 seconds */}
      {inFinalCountdown ? (
        <div
          className="absolute top-1/2 left-1/2 z-40 -translate-x-1/2 -translate-y-1/2 animate-pulse"
          data-ocid="classroom.timer.countdown"
        >
          <div className="flex size-40 flex-col items-center justify-center rounded-full border-4 border-destructive bg-destructive/10 shadow-xl backdrop-blur-sm">
            <span className="font-mono text-6xl font-bold text-destructive">
              {ss}
            </span>
            <span className="text-sm font-semibold text-destructive">
              seconds left!
            </span>
          </div>
        </div>
      ) : null}

      {/* Teacher-only reset control while running — the countdown itself stays
          hidden until the final 3 seconds */}
      {isRunning && remaining > 3 && isTeacher ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-3 left-3 z-30 size-8 rounded-full bg-card/90 text-muted-foreground shadow-subtle backdrop-blur-sm"
          onClick={() => setShowConfig(true)}
          aria-label="Reset timer"
          data-ocid="classroom.timer.reset_button"
        >
          <TimerIcon className="size-4" />
        </Button>
      ) : null}

      {/* Teacher open button when no timer running */}
      {isTeacher && !isRunning ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="absolute top-3 left-3 z-30"
          onClick={() => setShowConfig(true)}
          data-ocid="classroom.timer.open_button"
        >
          <TimerIcon className="size-4" /> Set timer
        </Button>
      ) : null}

      {/* Close the config when the overlay is dismissed */}
      {!open ? null : null}
    </>
  );
}
