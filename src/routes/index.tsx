// Home page route (path: "/")
// This is the first screen users see after the app loads.
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>AI StudyMate</h1>
      <p>Upload notes, ask questions, and study smarter.</p>
    </main>
  );
}
