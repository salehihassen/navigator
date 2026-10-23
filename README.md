# Navigator

A self-hostable atlas of the trips you've taken, the ones you're planning, and the
someday ideas. You can spin it as a 3D globe or flatten it to a map. Each trip holds
its stops, notes, photos, videos and saved links.

Status: early development (M0). See [PLAN.md](PLAN.md) for the plan and
[docs/SETUP.md](docs/SETUP.md) to run it.

## Layout

| Path | What |
| --- | --- |
| `backend/` | FastAPI app (`navigator` package), Alembic migrations, tests |
| `frontend/` | Vite + TypeScript single-page app |
| `deploy/dev/` | Local development stack (Postgres + Garage), compose project `navigator-dev` |
| `deploy/prod/` | Example compose entries and Caddyfile for a single VPS |
| `deploy/mockup/` | Static container serving the design mockups |
| `mockups/` | Clickable design mockups. `e-d-busy` is the chosen design. |
| `scripts/` | Dev and deploy helpers |

## Quick start

```sh
scripts/dev-up                            # Postgres + Garage; writes .dev/navigator.env on first run
scripts/dev-backend                       # migrate, then the API on :8930
cd frontend && pnpm install && pnpm dev   # http://localhost:5173
scripts/dev2go                            # all of the above in one go, open from other machines at http://<host>:5173
scripts/dev-test                          # lint, types, tests
```

Full setup (GitHub, WorkOS, production) is in [docs/SETUP.md](docs/SETUP.md).

## Viewing the mockups

```sh
cd mockups && python3 -m http.server 8000
```

## License

[MIT](LICENSE)
