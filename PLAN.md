# Navigator — plan

Navigator is a self-hostable web app for the trips you've taken, the ones you're
planning, and the ones you're only dreaming about. Spin a 3D globe or flatten it to a
map. Each trip holds its stops, notes, photos, videos and saved links (TikTok,
Instagram, YouTube, blogs).

Status: **M0 (skeleton)**. The UX is settled in `mockups/e-d-busy/`. The app
recreates that mock with real accounts and persistence.

Terms: an **atlas** is the whole collection of one person's trips. It is also the
tenant: every piece of data belongs to exactly one atlas.

## Goals (v1)

- The `mockups/e-d-busy` UI and UX, unchanged, backed by real data:
  - globe ⇄ map, country shading, clusters, focused routes, photo pins
  - a list with folded years, a scrubber, stacked repeat places, scroll-follow and Highlights
  - filters stored in the URL, so Back and Forward undo and redo them
  - undated "Someday" ideas on a posterboard, multi-country trips
- **Multi-tenant, with no sharing in v1.** Nobody can see another atlas. Isolation is
  enforced in app code *and* with Postgres row-level security, and proven by an
  isolation test suite that covers every API route.
- **Sign-in with Google or an email code** through WorkOS AuthKit. Apple comes later. Open
  sign-up, a three-step onboarding, and every atlas starts empty.
- **Media:** photo and video uploads plus link cards. 3 GB per atlas. Photos are
  stored as a version capped at 2560 px plus a thumbnail, never camera originals.
- **The browser does the heavy work:** it resizes photos, strips EXIF, makes video
  posters and works out each stop's country. The server stores data and checks
  access, so a small VPS is enough.
- **Data export** in Settings: an instant trips-only JSON and CSV, or a full ZIP with
  media. The export format (`navigator/1`) can be imported back.

## Not in v1

Sharing and collaboration, chat-based trip import (next after v1), Apple sign-in,
Immich, local-folder media, reel archiving, GPX/CSV import, offline use and PWA, sample data.

## Stack

| Layer | Choice |
| --- | --- |
| Backend | FastAPI, Python 3.14, uv, Pydantic v2, SQLAlchemy 2 (async) + psycopg 3, Alembic |
| Database | Postgres 18 (RLS, `uuidv7()`) in its own container |
| Auth | WorkOS AuthKit (Google OAuth, Magic Auth email codes). Navigator issues its own opaque session cookie. |
| Media | S3 API through a `Storage` interface. A Garage container on the VPS now, B2 or similar later. The browser uploads and downloads directly with limited-scope signed URLs. |
| Frontend | Vite + TypeScript, no framework. The mock is split into modules. Web Workers for image work. |
| Map | MapLibre GL 5, OpenFreeMap tiles |
| Place search | Photon (komoot), called from the browser, behind a `geocoder` adapter that can switch to a keyed provider |
| Jobs | A Postgres table queue (`FOR UPDATE SKIP LOCKED`) for link previews and cleanup |
| CI/CD | GitHub Actions, images on GHCR. The server pulls images and never builds. |

## Tenant isolation (defence in depth)

1. **Session:** an opaque random token in a `__Host-navigator` cookie, stored hashed. The
   active atlas comes from the session, never from the client.
2. **Request context:** resolves `(user, atlas, role)` and checks membership. Every route needs
   it apart from a short allowlist.
3. **Scoped repositories:** handlers never query directly. Every query filters by `atlas_id`.
4. **Postgres RLS:** `FORCE ROW LEVEL SECURITY` on every tenant table. The policy compares
   against `app.atlas_id`, set with `SET LOCAL` per transaction. If it's missing, queries
   return no rows. The runtime role isn't the owner and lacks `BYPASSRLS`.
5. **Composite foreign keys:** `(atlas_id, trip_id)`, so rows can't point across atlases.
6. **Uniform 404s** for ids in other atlases. Ids are UUIDv7.
7. **Media:** keys are `atlas/<atlas_id>/<media_id>/<variant>`, signed only after an RLS
   lookup, for one key and one method, valid for minutes, with length and type pinned on
   upload. The bucket is private and served from a separate origin. CORS allows only the app.
8. **Caches and client:** API responses are `private, no-store`. Browser storage is namespaced by
   user and cleared on sign-out.
9. **Jobs, logs and exports** carry the atlas id. Logs never contain trip content.
10. **Proof:** the isolation suite walks every route in the OpenAPI schema as a second
    user. A route with no coverage fails CI.

## Data model (summary)

`app_user` (keyed by WorkOS user id), `atlas` (quota), `atlas_member` (owner, editor
and viewer; v1 only creates owner), `session`, `trip` (status past/planned/idea, dates or
season, starred, version for optimistic concurrency, soft delete), `stop` (ordered,
country code, lat/lng, nights, maybe), `note`, `tag`/`trip_tag`,
`companion`/`trip_companion`, `media` + `link_meta`, `user_pref`, `job`, `audit_event`.

## Milestones

| # | Scope | Done when |
| --- | --- | --- |
| M0 | Repo layout, local dev stack, Dockerfile, CI, image on GHCR, Alembic baseline, `/healthz` and `/readyz` | CI is green and the image serves `/healthz` |
| M1 | WorkOS sign-in and sign-out, sessions, landing page, onboarding, tenancy core, RLS, isolation suite | Two accounts sign in to separate empty atlases, and the isolation suites are enforced |
| M2 | Split the mock into modules (parity tests stay green), trips, stops, notes, tags and companions APIs, optimistic store with undo, geocoder adapter, preferences, Settings, trips-only export, delete account | The mock's Playwright checks pass against the real API |
| M3 | First public deploy: domain, Caddy, Garage, backups with a tested restore, legal pages | A second person signs in from a phone and their trips are invisible to others |
| M4 | Media: image worker, signed uploads and downloads, quota, gallery, link cards (SSRF-safe), full ZIP export | Phone uploads work on iOS and Android, and the media isolation tests pass |
| M5 | Posterboard parity, idea → planned, trash, sessions list, hints, accessibility | The visual parity suite passes |

Later: chat import producing `navigator/1` JSON, sharing (atlas members and read-only
links), Apple sign-in, Immich, a PWA.

## Configuration

Everything comes from environment variables. See [`.env.example`](.env.example). Nothing
secret is ever committed. Setup steps are in [docs/SETUP.md](docs/SETUP.md).
