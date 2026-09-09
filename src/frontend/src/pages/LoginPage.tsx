import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignIn } from "@/hooks/useAuth";
import type { SessionRole } from "@/lib/types";
import { useSessionStore } from "@/store/session";
import { useNavigate } from "@tanstack/react-router";
import { GraduationCap, Sparkles, UserRound } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const ROLES: { value: SessionRole; label: string; hint: string }[] = [
  { value: "student", label: "Student", hint: "Join a class and follow along" },
  { value: "teacher", label: "Teacher", hint: "Lead a live classroom" },
];

function validateName(value: string): string | null {
  if (!value.trim()) return "Please enter your name.";
  if (value.trim().length < 2)
    return "Your name should be at least 2 characters.";
  return null;
}

/** Dedicated sign-in page. Collects only a name and role (student or teacher),
 * stores the session identity, and routes to the Lobby on submit. */
export function LoginPage() {
  const navigate = useNavigate();
  const role = useSessionStore((s) => s.role);
  const signIn = useSignIn();

  // Signed-in users are redirected away from the login page to the Lobby.
  useEffect(() => {
    if (role) {
      void navigate({ to: "/" });
    }
  }, [role, navigate]);

  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<SessionRole>("student");
  const [nameError, setNameError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextNameError = validateName(name);
    setNameError(nextNameError);
    if (nextNameError) return;
    signIn({ name: name.trim(), role: selectedRole });
    void navigate({ to: "/" });
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-10">
      {/* Soft pastel auth backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-auth"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 -z-10 size-80 rounded-full bg-accent/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 -z-10 size-80 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 left-1/4 -z-10 size-40 rounded-full bg-accent/30 blur-2xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-md"
        data-ocid="login.page"
      >
        <div className="rounded-3xl border border-border bg-card p-8 shadow-xl">
          <div className="mb-6 text-center">
            <span className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-subtle">
              <GraduationCap className="size-8" />
            </span>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Welcome to Math Classroom
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell us who you are to join the lobby.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
            noValidate
          >
            <div className="grid gap-2">
              <Label
                htmlFor="login-name"
                className="text-sm font-semibold text-foreground"
              >
                Your name
              </Label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-name"
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (nameError) setNameError(null);
                  }}
                  placeholder="e.g. Alex Rivera"
                  autoComplete="name"
                  aria-invalid={nameError ? true : undefined}
                  aria-describedby={nameError ? "login-name-error" : undefined}
                  className="h-12 rounded-2xl border-input bg-card pl-10 text-base"
                  data-ocid="login.name_input"
                />
              </div>
              {nameError ? (
                <p
                  id="login-name-error"
                  className="text-sm font-medium text-destructive"
                  data-ocid="login.name_error"
                >
                  {nameError}
                </p>
              ) : null}
            </div>

            <fieldset className="grid gap-2">
              <legend className="text-sm font-semibold text-foreground">
                I am a…
              </legend>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((option) => {
                  const active = selectedRole === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedRole(option.value)}
                      aria-pressed={active}
                      className={`flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-smooth ${
                        active
                          ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                          : "border-input bg-card hover:border-primary/50 hover:bg-accent"
                      }`}
                      data-ocid={`login.role_${option.value}`}
                    >
                      <span
                        className={`text-base font-bold ${
                          active ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {option.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {option.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <Button
              type="submit"
              size="lg"
              className="h-12 w-full rounded-full bg-gradient-primary text-base font-bold text-primary-foreground shadow-subtle hover:opacity-90"
              data-ocid="login.submit_button"
            >
              Enter the Lobby
            </Button>
          </form>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-accent" />
            No account needed — just your name and role.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
