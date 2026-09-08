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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { SessionRole } from "@/lib/types";
import { useSessionStore } from "@/store/session";
import { useNavigate, useParams } from "@tanstack/react-router";
import { GraduationCap, UserRound } from "lucide-react";
import { useState } from "react";

const ROLE_OPTIONS: { value: SessionRole; label: string; hint: string }[] = [
  {
    value: "teacher",
    label: "Teacher",
    hint: "Lead the class and guide the lesson",
  },
  {
    value: "student",
    label: "Student",
    hint: "Join in, answer, and learn together",
  },
];

/**
 * Room entry gateway. Reached from a direct room link (/join/$roomCode). Shows
 * a pop-up modal asking the participant to pick their role and enter a name
 * before entering the live session.
 */
export function RoomAuthGateway() {
  const { roomCode } = useParams({ from: "/join/$roomCode" });
  const navigate = useNavigate();
  const setSession = useSessionStore((s) => s.setSession);

  const [role, setRole] = useState<SessionRole>("student");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      setError("Please enter your name to join the class.");
      return;
    }
    setSession({ role, name: trimmedName });
    void navigate({ to: "/classroom/$roomCode", params: { roomCode } });
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-10">
      {/* Soft pastel backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-accent/30 via-background to-secondary/40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 -z-10 size-72 rounded-full bg-accent/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 -z-10 size-72 rounded-full bg-primary/20 blur-3xl"
      />

      <Dialog open>
        <DialogContent
          showCloseButton={false}
          className="max-w-md rounded-3xl border-border bg-card p-0 shadow-xl"
        >
          <div className="rounded-t-3xl bg-gradient-primary px-6 py-8 text-center text-primary-foreground">
            <span className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-white/20">
              <GraduationCap className="size-8" />
            </span>
            <DialogTitle className="text-2xl font-bold text-primary-foreground">
              Join the classroom
            </DialogTitle>
            <DialogDescription className="mt-1 text-primary-foreground/90">
              Room code: <span className="font-bold">{roomCode}</span>
            </DialogDescription>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 px-6 py-6"
          >
            <fieldset className="grid gap-3">
              <legend className="mb-1 text-sm font-semibold text-foreground">
                I am joining as…
              </legend>
              <RadioGroup
                value={role}
                onValueChange={(value) => setRole(value as SessionRole)}
                className="grid gap-3"
                data-ocid="room_auth.role_group"
              >
                {ROLE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    htmlFor={`role-${option.value}`}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition-smooth ${
                      role === option.value
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`role-${option.value}`}
                      className="size-5"
                    />
                    <span className="flex flex-col">
                      <span className="font-display text-base font-bold text-foreground">
                        {option.label}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {option.hint}
                      </span>
                    </span>
                  </label>
                ))}
              </RadioGroup>
            </fieldset>

            <div className="grid gap-2">
              <Label
                htmlFor="name"
                className="text-sm font-semibold text-foreground"
              >
                Your name
              </Label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. Maya"
                  autoComplete="name"
                  maxLength={40}
                  className="h-12 rounded-2xl border-input bg-card pl-10 text-base"
                  data-ocid="room_auth.name_input"
                />
              </div>
              {error ? (
                <p
                  className="text-sm font-medium text-destructive"
                  data-ocid="room_auth.name_error"
                >
                  {error}
                </p>
              ) : null}
            </div>

            <DialogFooter className="sm:justify-center">
              <Button
                type="submit"
                size="lg"
                disabled={!canSubmit}
                className="w-full rounded-2xl text-base font-bold"
                data-ocid="room_auth.enter_button"
              >
                Enter classroom
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
