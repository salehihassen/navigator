import { defineConfig, loadEnv } from "vite";

// In development Vite serves the app on :5173 and forwards API and auth calls to
// the backend (scripts/dev-backend, :8930), so the browser sees one origin, exactly
// like production where the backend serves the built files itself.
const backend = "http://127.0.0.1:8930";

export default defineConfig(({ mode }) => {
  // scripts/dev2go serves on 0.0.0.0 and passes this machine's hostnames here at
  // runtime, so they never land in git. IP addresses are always allowed by Vite.
  const env = loadEnv(mode, ".", "NAVIGATOR_DEV_");
  const allowedHosts = (env["NAVIGATOR_DEV_ALLOWED_HOSTS"] ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);

  return {
    server: {
      host: "127.0.0.1",
      port: 5173,
      strictPort: true,
      allowedHosts,
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
  };
});
