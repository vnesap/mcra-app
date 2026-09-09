import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/store/session";
import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";

/** Top navigation bar for the math classroom app. */
export function AppHeader() {
  const name = useSessionStore((s) => s.name);
  const role = useSessionStore((s) => s.role);

  return (
    <header className="sticky top-0 z-40 border-b bg-card shadow-subtle">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-lg font-bold text-foreground"
          data-ocid="app_header.home_link"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </span>
          Math Classroom
        </Link>

        <div className="flex items-center gap-3">
          {name ? (
            <span
              className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
              data-ocid="app_header.session_badge"
            >
              {name} · {role === "teacher" ? "Teacher" : "Student"}
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                data-ocid="app_header.lobby_button"
              >
                <Link to="/">Lobby</Link>
              </Button>
              <Button asChild size="sm" data-ocid="app_header.login_link">
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
