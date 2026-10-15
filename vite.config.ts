import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Vite = dev server + bundler. The React plugin enables JSX/TSX and Fast Refresh (live reload).
// The dev server runs on http://localhost:5173 (this must match FRONTEND_URL in backend/.env for CORS).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
