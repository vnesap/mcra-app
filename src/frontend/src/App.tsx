import { Layout } from "@/components/Layout";
import { LiveClassroom } from "@/pages/LiveClassroom";
import { Lobby } from "@/pages/Lobby";
import { RoomAuthGateway } from "@/pages/RoomAuthGateway";
import { useSessionStore } from "@/store/session";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

// Define the core application layout wrapper
const rootRoute = createRootRoute({
  component: Layout,
});

/** 1. Classroom Lobby — the default landing view. */
const lobbyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Lobby,
});

/** 2. Room entry gateway — role/name pop-up before entering a live session. */
const roomAuthRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/join/$roomCode",
  component: RoomAuthGateway,
});

/** 3. Live Virtual Classroom — the collaboration hub. */
const classroomRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/classroom/$roomCode",
  component: LiveClassroom,
});

// Compile the screen navigation tree structure
const routeTree = rootRoute.addChildren([
  lobbyRoute,
  roomAuthRoute,
  classroomRoute,
]);

const router = createRouter({ routeTree });

/**
 * Master Application Module
 * Forces the user to configure a name and role before accessing the creation engine
 */
export default function App() {
  const name = useSessionStore((s) => s.name);

  // If the user hasn't typed their name yet, intercept the screen freeze and render the sign-in gateway!
  if (!name) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <RoomAuthGateway />
      </div>
    );
  }

  // Once signed in, grant standard access to the full platform router system
  return <RouterProvider router={router} />;
}
