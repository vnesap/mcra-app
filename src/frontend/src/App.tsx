import { Layout } from "@/components/Layout";
import { LiveClassroom } from "@/pages/LiveClassroom";
import { Lobby } from "@/pages/Lobby";
import { LoginPage } from "@/pages/LoginPage";
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

/** Sign-in page — name and role only. */
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

/** Live Virtual Classroom — the collaboration hub. */
const classroomRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/classroom/$roomCode",
  component: LiveClassroom,
});

const routeTree = rootRoute.addChildren([
  lobbyRoute,
  loginRoute,
  classroomRoute,
]);

const router = createRouter({ routeTree });

export default function App() {
  return <RouterProvider router={router} />;
}
