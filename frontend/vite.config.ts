import { defineConfig } from "vite";

// In development Vite serves the app on :5173 and forwards API and auth calls to
// the backend (scripts/dev-backend, :8930), so the browser sees one origin, exactly
// like production where the backend serves the built files itself.
const backend = "http://127.0.0.1:8930";

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": backend,
      "/auth": backend,
      "/healthz": backend,
      "/readyz": backend,
    },
  },
  build: {
    target: "es2023",
    sourcemap: true,
  },
});
