// M0 placeholder shell: proves the build, the dev proxy and the API wiring end to end.
// The D-busy mock is ported into modules here in M2.
import "./style.css";

type Ready = { status: "ok" | "unavailable"; checks: Record<string, string> };

async function checkServer(el: HTMLElement): Promise<void> {
  try {
    const res = await fetch("/readyz", { headers: { Accept: "application/json" } });
    const body = (await res.json()) as Ready;
    el.dataset.state = body.status === "ok" ? "ok" : "down";
    el.textContent = body.status === "ok" ? "Server is ready." : `Server is starting up (${Object.entries(body.checks).filter(([, v]) => v !== "ok").map(([k]) => k).join(", ")}).`;
  } catch {
    el.dataset.state = "down";
    el.textContent = "Can't reach the server.";
  }
}

const status = document.querySelector<HTMLElement>("#status");
if (status) void checkServer(status);
