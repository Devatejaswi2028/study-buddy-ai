// Root layout shared by every route.
// Anything placed here (fonts, global nav, providers) appears on all pages.
import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Outlet />
    </>
  );
}
