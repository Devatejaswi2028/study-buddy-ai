// Client-side start configuration.
// Attaches middleware used by server functions (auth tokens, CSRF, etc.).
import { createStart, type StartClientOptions } from "@tanstack/react-start";

export const startInstance = createStart({
  // Add client middleware here when needed (e.g., attachSupabaseAuth)
} as StartClientOptions);
