import { createActor } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SessionRole } from "@/lib/types";
import { useActor } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { Smile, UserRound, X } from "lucide-react";
import { useState } from "react";

interface SpotlightRosterProps {
  online: Principal[];
  currentName: string;
  role: SessionRole | null;
  onClose: () => void;
}

/** Emoji stickers the teacher can affix onto a student's video frame. */
const STICKERS = ["⭐", "🌟", "🎉", "🏆", "💯", "❤️", "👍", "🎯"];

/**
 * Teacher Spotlight roster. Selecting a student forces a 50/50 side-by-side
 * split (teacher left, student right) until toggled off.
 */
export function SpotlightRoster({
  online,
  currentName,
  role,
  onClose,
}: SpotlightRosterProps) {
  const { actor } = useActor(createActor);
  const [selected, setSelected] = useState<string | null>(null);
  const [stickerFor, setStickerFor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isTeacher = role === "teacher";

  // Build a roster of students from the online participants.
  const roster = Array.from(
    { length: Math.max(online.length, 3) },
    (_, i) => `Student ${i + 1}`,
  );

  async function handleSelect(studentName: string) {
    if (!actor) return;
    setSelected(studentName);
    setBusy(true);
    try {
      await actor.setSpotlight(studentName);
    } finally {
      setBusy(false);
    }
  }

  async function handleSticker(studentName: string, symbol: string) {
    if (!actor) return;
    setStickerFor(null);
    setBusy(true);
    try {
      await actor.setSticker(studentName, symbol);
    } finally {
      setBusy(false);
    }
  }

  async function handleClear() {
    if (!actor) return;
    setSelected(null);
    setBusy(true);
    try {
      await actor.setSpotlight("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserRound className="size-5" /> Spotlight a student
          </DialogTitle>
          <DialogDescription>
            {isTeacher
              ? "Select a student to force a 50/50 side-by-side split until you turn it off."
              : "Only the teacher can spotlight a student."}
          </DialogDescription>
        </DialogHeader>

        {isTeacher ? (
          <div className="grid max-h-72 gap-2 overflow-y-auto pr-1">
            {roster.map((student) => (
              <div
                key={student}
                className={`rounded-xl border-2 transition-smooth ${
                  selected === student
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => void handleSelect(student)}
                    disabled={busy}
                    className="flex flex-1 items-center justify-between text-left"
                    data-ocid="classroom.roster.student_item"
                  >
                    <span className="font-medium text-foreground">
                      {student}
                    </span>
                    {selected === student ? (
                      <span className="text-xs font-semibold text-primary">
                        Spotlighted
                      </span>
                    ) : null}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setStickerFor((v) => (v === student ? null : student))
                    }
                    disabled={busy}
                    aria-label={`Affix a sticker to ${student}`}
                    className="ml-3 inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground"
                    data-ocid="classroom.roster.sticker_button"
                  >
                    <Smile className="size-3.5" /> Sticker
                  </button>
                </div>
                {stickerFor === student ? (
                  <div className="flex flex-wrap gap-1.5 border-t border-border/60 px-4 py-2.5">
                    {STICKERS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => void handleSticker(student, emoji)}
                        disabled={busy}
                        className="flex size-9 items-center justify-center rounded-lg border border-border bg-card text-lg transition-smooth hover:scale-110 hover:border-primary/50"
                        aria-label={`Affix ${emoji} to ${student}`}
                        data-ocid="classroom.roster.sticker_option"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            You are viewing as {currentName || "a student"}. Ask your teacher to
            spotlight you.
          </p>
        )}

        <div className="flex justify-end gap-2">
          {isTeacher ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleClear()}
              disabled={busy}
              data-ocid="classroom.roster.clear_button"
            >
              <X className="size-4" /> Turn off
            </Button>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            data-ocid="classroom.roster.close_button"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
