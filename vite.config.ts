// Vite + TanStack Start configuration
// This file tells Vite how to bundle the app and where the server entry lives.
import { defineConfig } from "@tanstack/react-start/config";

export default defineConfig({
  server: {
    // SSR entry point for the TanStack Start server
    entry: "src/server.ts",
  },
});
