import { Layout } from "@/components/Layout";
import { LiveClassroom } from "@/pages/LiveClassroom";
import { Lobby } from "@/pages/Lobby";
import { RoomAuthGateway } from "@/pages/RoomAuthGateway";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: Layout,
});

/** Classroom Lobby — the default landing view. */
const lobbyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Lobby,
});

/** Room entry gateway — role/name modal before entering a live session. */
const roomAuthRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/join/$roomCode",
  component: RoomAuthGateway,
});

/** Live Virtual Classroom — the collaboration hub. */
const classroomRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/classroom/$roomCode",
  component: LiveClassroom,
});

const routeTree = rootRoute.addChildren([
  lobbyRoute,
  roomAuthRoute,
  classroomRoute,
]);

const router = createRouter({ routeTree });

export default function App() {
  return <RouterProvider router={router} />;
}
