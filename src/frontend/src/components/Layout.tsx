import { AppHeader } from "@/components/AppHeader";
import { Outlet } from "@tanstack/react-router";

/** Shared application shell: header, routed content, and footer. */
export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t bg-card py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="text-primary underline-offset-4 hover:underline"
          data-ocid="app_footer.caffeine_link"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
