# Existing solutions vs building Trip Atlas

Researched 2026-10-13. Facts come from the official repos, READMEs, docs, source code
(shallow clones read at HEAD on that date), and vendor pricing pages. Star counts and
dates come from the GitHub API on 2026-10-13. Pricing for the hosted apps comes from
vendor pages where I could load them; otherwise it is marked *(secondary)*.

## Recommendation (short)

1. **Try TREK first** (`liketrek/TREK`, AGPL-3.0, v4.3.3, about 14.8k stars, very active).
   It covers the new sharing requirement better than anything else: read-only public
   links with no account needed, guests, live collaboration, and an installable PWA. It
   also references Immich photos by asset ID and proxies them without copying. It runs
   as one container with SQLite. What it lacks from the wishlist: a 3D globe (only with a
   paid Mapbox token), a single "all my trips" world map, inline embeds for saved reels,
   and a Pinterest-style inspiration board. Its Immich support also only lives inside
   the Journey addon, which is off by default.
2. **AdventureLog** is the runner-up. Its model is closest to "pins of visited and
   planned places on a world map, grouped into trips". The tradeoffs: no globe
   (it uses MapLibre 4.7), Immich photos are **copied locally by default**, no video,
   collaborators need accounts, and it needs PostGIS, so it can't share your existing
   Postgres 18.
3. **If the globe, collage and inspiration board are the point of the project, build
   Trip Atlas** (Path C) as planned, and borrow TREK's sharing design: a token link,
   view-only, with sections you can toggle. A middle path worth a spike is **Path B:
   a TREK plugin** that adds a globe/atlas page. TREK ships a sandboxed plugin SDK with
   map-layer and page extension points.

My call: spend half a day running TREK with an Immich test instance. If its trip and
journey views feel good enough, adopt it (Path A) and write a globe plugin later
(Path B). If you keep missing the "one world, all my trips, spin it" view and the reel
board, build Trip Atlas. In that case, add a share-token table and a read-only route
to v1 instead of treating sharing as a non-goal.

## Comparison table

| | TREK | AdventureLog | TRIP (itskovacs) | Surmai | Dawarich | Wanderlog | Polarsteps | Google My Maps |
|---|---|---|---|---|---|---|---|---|
| Open source / license | Yes, AGPL-3.0 | Yes, GPL-3.0 | Yes, MIT | Yes, MIT | Yes, AGPL-3.0 | No | No | No |
| Self-host | 1 container, SQLite | 2 containers (app + `postgis/postgis:16-3.5`) | 1 container, SQLite | 1 container (PocketBase) | 4 (app, sidekiq, redis, postgis 17) | — | — | — |
| Latest release | v4.3.3, 2026-09-26 | v0.13.0, 2026-08-12 (dev branch active Oct) | 1.50.1, 2026-10-02 | v0.5.6, 2026-10-01 ("very alpha") | 1.15.3, 2026-09-30 | hosted | hosted | hosted |
| Stars (approx) | 14.8k | 3.8k | 2.0k | 285 | 10.7k | — | — | — |
| 3D globe | Only with Mapbox GL + token ("high quality" setting). MapLibre/Leaflet are flat | No (MapLibre 4.7). Has 3D *terrain* basemaps | No (Leaflet) | No (Leaflet) | Yes, `globeProjection` setting (MapLibre 6) | No | Yes, in Plus (3D maps/globe) | No |
| World map of all trips | Atlas = visited countries/regions (Leaflet). Map is per trip | Yes: all locations, filter visited/planned | Yes: POI map | Per trip | Yes, from GPS history | Per trip | Yes, profile world map | One map per "map" |
| Past + planned | Yes (dashboard Planned/Completed/Archived, Journey for past) | Yes (visits + dated collections) | Mostly planning | Planning | Past only (derived from tracking) | Planning (+ journal) | Both | Manual |
| Media | Upload, or Immich/Synology **by reference** (proxied); video upload ≤500 MB | Upload, or Immich (copied by default, `copy_locally=True`; proxy when off); images only | Attachments | Attachments | Immich/PhotoPrism photos on map and trips | Upload | Upload photos/video | Images, YouTube URL per placemark |
| Immich specifics | Journey addon: browse timeline/albums, day search sorted by GPS distance, album sync, optional mirror-to-Immich. Key encrypted server-side | Search/browse albums, API key scopes asset.read/view, album.read; EXIF GPS stored | — | — | Imports photo geodata, shows photos on map and trips | — | — | — |
| Saving reels/TikTok links | Plain links on places/collections. Chat has link previews. No embeds | `link` field and note `links[]`, plain URLs | Plain links | Notes | — | Imports places from pasted/shared videos (new, fall 2026) *(secondary)* | No | No |
| Gallery / collage | Journey gallery (photos + video), public gallery share | Per-location image carousel | — | — | Trip photos | Basic | Yes, plus printed Travel Books | — |
| Public read-only link | Yes, no account. Trip `/shared/<token>`, 90-day rolling expiry, toggle bookings/packing/costs/chat. Journey links toggle timeline/gallery/map | Yes, public collections/locations | Yes, "anonymous share" base or full | No (collaborators only) | Yes, shared links for trips/tracks (photos optional) | Yes | Yes (public/friends/private) | Yes |
| Collaborators | Members by email/username, owner transfer, guests with no login, 16-action permission matrix, real-time WebSocket | `shared_with` users on the same instance (accounts needed) | Members (accounts) | Collaborators (accounts) | Family (location) | Live collab, free | Travel Buddies: 5 free, 10 in Plus | Google accounts for editors |
| Mobile | PWA with offline reads/writes and offline tiles | Responsive web | Responsive web | PWA | iOS/Android apps + web | Native apps | Native apps | Web + Google Maps app (view) |
| Cost (hosted) | free / self-host | free / self-host | free | free | Cloud: Lite €59.99/yr, Pro €119.99/yr (globe + Immich) | Pro $39.99/yr *(secondary)* | Free; Plus €29.99/yr or €8.99/mo | Free |

Others checked: **TripIt** (Pro $49/yr, itinerary from email, "Inner Circle" sharing,
no photo/map journal). **Tripsy** (Apple-only. Pro $59.99/yr, $9.99/mo or $299
lifetime; unlimited guests in Pro). **Stippl** (free, Pro $24.99/yr *(secondary)*;
journal, "Trip Reels", photobook; no social-link import found on the site).
**Mapstr** (place saver: share sheet from Instagram/TikTok detects a place; shareable
browser link; Plus tier). **Roadtrippers** (US road trips, waypoint-capped tiers
$35.99–$59.99/yr *(secondary)*). None of these reference your own photo library or
self-host, so they are out unless you give up the Immich requirement.

**"Voyage"**: no maintained travel app or AdventureLog fork by that name was found on
GitHub or Codeberg (2026-10-13). Treat it as nonexistent or abandoned.

Small, very young self-hosted journals turned up by GitHub topic search (all under
10 stars, not recommended, listed so you know they exist): `pinpox/trippy-track`,
`azusachino/felicia`, `severinlindenmann/fernscout`, `dabohlica/FreeRange`,
`linkingoscar/footprint` (has a 3D "light-up globe", Chinese UI, Amap).
`jiangjihui/ImmichTravelMap` replays Immich GPS as a track and is an idea source only.

## Per-candidate notes

### TREK (`liketrek/TREK`, formerly `mauriceboe/TREK`)
- The repo moved to the `liketrek` org. The Docker image is still `mauriceboe/trek`.
  Stack: NestJS 11, React 19, SQLite, WebSocket at `/ws`. Caddy needs no special config.
  Helm chart available. Very active: 100+ commits in the last 30 days, 1.3k forks.
- **Maps:** Leaflet, Mapbox GL, or MapLibre GL (OpenFreeMap, no token).
  `projection = 'globe'` is only set when *not* using MapLibre
  (`client/src/components/Map/MapViewGL.tsx`). So the globe needs a Mapbox token,
  even though TREK bundles `maplibre-gl` 5.24, which supports globe. That makes the
  globe a small upstream PR, not a rewrite. Atlas (visited countries and regions,
  bucket list, stats) is Leaflet.
- **Immich:** documented in `wiki/Photo-Providers.md`: "TREK never copies the original
  files — it stores only a reference (provider name + asset ID) and proxies all image
  streams". The API key is stored encrypted. Search by day ranks results by GPS
  distance to the entry. Albums can be synced. Photos shared on a trip load through the
  sharer's connection. This sits under the **Journey** addon, which is off by default.
  An Immich on a private LAN or tailnet address needs the "internal network access"
  setting because of an SSRF guard.
- **Sharing:** trip public link (no account; Map & Plan always on; Bookings on by
  default; Packing, Costs and Chat off by default; 90-day expiry renewed on each save).
  Journeys have their own public link with Timeline, Gallery and Map toggles, and
  geotagged photos appear as map pins. Members, guests, invite links, OIDC, passkeys.
- **Gaps:** no reel embeds or inspiration board (Collections is a place library with
  links). No local-folder referencing. Feature-heavy: bookings, costs, packing, MCP and
  plugins are much more than "minimal". Plugin SDK (`trek-plugin-sdk`) exposes map
  layers, Atlas layers and pages (opaque-origin iframe), which is useful for Path B.

### AdventureLog (`seanmorley15/AdventureLog`)
- Django + DRF + PostGIS, SvelteKit, svelte-maplibre (`maplibre-gl@4.7.1` in the
  lockfile). Compose has `app` plus `postgis/postgis:16-3.5`. Needs 2 GB RAM on first
  boot. Default login admin/admin. No hosted plan on adventurelog.app.
- Release cadence: v0.13.0 shipped 2026-08-12. `main` has been quiet since then, but the
  `development` branch has commits up to 2026-10-05, and there are `dawarich` and
  v0.13.1 changelog branches.
- **Model:** Locations (pins with visits, images, link, tags, rating). Collections
  (no dates = folder; with dates = itinerary with route, lodging, transportation, notes,
  checklists). World travel book (countries/regions/cities). The map filters
  visited/planned. "3D" means terrain basemaps, not a globe. "Globe spin" in
  worldtravel is a random-country picker animation.
- **Immich:** `integrations/views/immich_view.py` searches by metadata and date and
  browses albums. It proxies `/assets/{id}/thumbnail?size=preview` with access checks
  (public location > public collection > shared collection > owner). However,
  `ImmichIntegration.copy_locally` **defaults to True**: "Copy image to local storage,
  instead of just linking to the remote URL". You can switch it off to keep references.
  The `ContentImage` model is images only (`ResizedImageField` + `immich_id`), so there
  is no video. v0.13 added EXIF/Immich GPS on images and Immich v3 compatibility.
- **Sharing:** `is_public` on locations and collections gives anonymous read.
  `Collection.shared_with` lets other *accounts on your instance* collaborate. v0.13
  tightened permission checks. No guest or no-login editing.
- **Gaps:** globe, video, reel embeds/board, collage layout, local folders. Can't reuse
  your Postgres 18 without adding PostGIS.

### TRIP (`itskovacs/trip`)
- FastAPI + Angular, Leaflet, SQLite in `storage/`. One container. MIT. Demo on
  Netlify. A POI map tracker plus multi-day planner with members and an anonymous
  read-only share (base or full, with attachments). No Immich, no photos-first views,
  no globe. Good planning tool, weak for "past trips memory".

### Surmai (`rohitkumbhar/surmai`)
- React + Mantine + PocketBase, Leaflet, PWA, MIT. Self-described as "very very alpha".
  Focused on logistics (bookings, docs) for a couple or family. Collaborators need
  accounts, and I found no public links. No Immich, no globe. Not a fit.

### Dawarich (`Freika/dawarich`), adjacent
- A Google Timeline replacement: Rails, PostGIS, Redis, Sidekiq (4 containers).
  MapLibre 6 with a **globe projection** setting. Trips are derived from recorded GPS
  points and can show Immich/PhotoPrism photos. Shareable links for trips, tracks,
  timelines and live location, with photos optional. Great for "where was I" if you
  run OwnTracks or Overland. It can't do future planning, saved reels or boards.
  AdventureLog has a `dawarich` branch, which suggests an integration is coming.

### Hosted products
- **Polarsteps:** the closest commercial match for "past trips on a world map plus
  photos plus followers". Free core includes planning, tracking and sharing, and
  followers are free. Plus (€29.99/yr) adds 3D maps/globe and 10 Travel Buddies.
  Photos must be uploaded (no Immich). No reel saving. Data lives on their servers.
- **Wanderlog:** the best hosted collaborative planner; collaboration is free. A new
  (fall 2026) import of places from pasted or shared TikTok/Instagram links is reported
  by third-party reviews to be imperfect *(secondary)*. Not a memories or photo app.
- **Google My Maps:** free, easy share links, editors need Google accounts. 2D only,
  layer limits, a weak media story (image URLs, YouTube). Fine as a throwaway, not as
  an archive.
- **Mapstr:** a good place-saver from Instagram/TikTok with share links that open in a
  browser. No trips-as-memories.
- **TripIt / Tripsy / Stippl / Roadtrippers:** itinerary and logistics tools. None
  reference your own photo library.

### Immich itself (once you run it, v3.3.1 released 2026-10-08)
It already has public shared-album links (no account, optional expiry and password,
download/upload toggles) and in-instance album sharing. With any option, the cheapest
way to share a trip's *photos* is an Immich shared album link. Trip Atlas or TREK only
needs to own the map and narrative.

## Gap analysis vs the wishlist

| Wishlist item | TREK | AdventureLog | Build (Trip Atlas) |
|---|---|---|---|
| 3D globe + 2D map toggle | Missing with MapLibre. A ~small PR or plugin, since maplibre 5 is bundled | Missing; needs maplibre 4→5 upgrade | Planned (MapLibre v5 `setProjection`) |
| One world map of past + planned trips with arcs | Missing (per-trip maps + country Atlas) | Partial (all pins, filter visited/planned; routes per collection) | Planned |
| CRUD trips/stops | Yes (rich) | Yes | Planned |
| Reference Immich, don't copy | Yes (Journey addon) | Partial (copies by default, toggle) | Planned |
| Reference local folders | No (upload only) | No | Planned |
| Save reels/TikTok/YouTube with preview, archive | Plain links only | Plain links only | Planned (OG + yt-dlp) |
| Past trip collage | Journey gallery (list/grid) | Image carousel | Planned (masonry) |
| Planned-trip inspiration board | No (Collections and notes are closest) | No (notes + links) | Planned |
| Share with friends: read-only link | **Yes, best-in-class** | Yes (public flag) | Must add (not in plan yet) |
| Share: collaborators | **Yes, incl. guests, real-time** | Yes (accounts) | Must add (users/auth = biggest new scope) |
| Minimal | No, very broad | Medium | Yes |
| Fits your stack (Postgres 18, FastAPI, Loki) | SQLite file, Node | Needs own PostGIS container | Yes |

## Three paths

### A. Self-host an existing OSS app as-is (TREK, or AdventureLog)
- **Effort:** 1–2 hours to deploy (compose entry, Caddy route, backup of `./data` and
  `./uploads`). Running Immich adds its own stack: server, ML, Redis, and Postgres with
  the vector extension. It is heavier than anything here, but you were going to need
  it for any Immich option.
- **You get now:** sharing, collaboration, PWA, offline, place search, imports,
  maintained by others.
- **You lose:** the globe, the all-trips world view, reel embeds and archiving, the
  inspiration board, local-folder media, and "minimal".
- **Risk:** AGPL is fine for personal use. You also take on upstream churn: TREK ships
  very often, so pin tags. With AdventureLog, Immich images are duplicated unless you
  turn off `copy_locally`.

### B. Self-host OSS and extend it (fork or upstream PRs or plugin)
- **TREK globe:** enable `projection: 'globe'` for the MapLibre renderer
  (maplibre-gl 5.24 is already a dependency). Probably a small PR, worth opening as an
  issue first.
- **TREK "world" page:** a plugin page or Atlas layer that draws all trips as pins and
  arcs on a MapLibre globe. Possible with the plugin SDK, but plugin pages run in an
  opaque-origin iframe with a permission and RPC model. Expect roughly 2–5 days to
  learn and build it, and confirm the SDK exposes trip/place reads first.
- **Reel board:** much harder to add cleanly to either app. It is a new entity and UI
  in a large codebase you don't own, and in TREK's case in React/NestJS rather than
  your usual FastAPI.
- **Tradeoff:** a fork means merge pain against a fast-moving upstream. Upstream PRs
  and plugins avoid that but depend on maintainer acceptance and SDK scope.

### C. Build Trip Atlas custom (current PLAN.md)
- **Effort:** the plan's milestones 2–6 are a few weekends for single-user. Adding
  sharing changes the scope:
  - **Read-only share links** (cheap, about 1 day): `share_link(token, trip_id,
    expires_at, show_media bool)`, a `/s/{token}` read-only route that serves the trip
    and its proxied Immich thumbnails only for assets attached to that trip. Never
    expose the Immich key or arbitrary asset IDs; scope the proxy by token.
  - **Collaborators** (expensive, several days): accounts or OIDC, per-trip roles,
    conflict handling. Consider skipping it. Friends could send you reels, or you could
    add an "anyone with the edit link can add to the board" token as a lightweight
    middle ground.
- **You get:** exactly the UX in the mockups, your stack, no unused features.
  **You own:** maintenance and security of anything exposed publicly.

### Sharing with friends: Tailscale vs public domain (applies to every path)
- **Tailnet only (e.g. `*.home.example.com`):** friends need a Tailscale
  account and client. You share the node with them, and they get access to only that
  machine, quarantined, on any plan. Fine for 1–3 techy friends, too much friction
  for "send a link".
- **Tailscale Funnel:** public HTTPS on `<node>.<tailnet>.ts.net` only (no custom
  domain), ports 443/8443/10000. Still beta, with unpublished bandwidth limits. Easiest
  way to make share links work without opening ports, but the whole service becomes
  public. Its login, rate limiting and 2FA then matter. TREK has these built in; a
  custom build would need them.
- **Public domain via Caddy (e.g. `trips.example.com`):** most flexible. Best pattern:
  keep the app tailnet-only and expose a **public vhost that only forwards the share
  routes** (and their asset/API calls). That is easy for Trip Atlas, because you design
  `/s/*` and `/api/public/*`. It is hard to do safely for TREK or AdventureLog, because
  their SPAs share the asset and API paths with the logged-in app, so you'd have to
  expose the whole app. Photos: either let the app proxy only the shared trip's assets
  or use Immich's own public album links.

## Sources
- TREK repo/README: https://github.com/liketrek/TREK (README, `docker-compose.yml`, `wiki/Photo-Providers.md`, `wiki/Public-Share-Links.md`, `wiki/Journey-Journal.md`, `wiki/Trip-Members-and-Sharing.md`, `wiki/Map-Settings.md`, `client/src/components/Map/MapViewGL.tsx`, `client/package.json`), release v4.3.3: https://github.com/liketrek/TREK/releases ; demo https://demo.liketrek.com ; image https://hub.docker.com/r/mauriceboe/trek
- AdventureLog repo: https://github.com/seanmorley15/AdventureLog (README, LICENSE, `docker-compose.yml`, `backend/server/integrations/views/immich_view.py`, `backend/server/integrations/models.py`, `backend/server/adventures/models.py`, `frontend/pnpm-lock.yaml`, `documentation/docs/changelogs/v0-13-0.md`, `documentation/docs/usage/usage.md`); site https://adventurelog.app ; Immich docs https://adventurelog.app/docs/configuration/immich_integration.html
- TRIP: https://github.com/itskovacs/trip ; docs https://itskovacs.github.io/trip/docs/intro (`docs/docs/trips-planner/trip-ano-share.md`)
- Surmai: https://github.com/rohitkumbhar/surmai ; https://surmai.app
- Dawarich: https://github.com/Freika/dawarich (`docker/docker-compose.yml`, `app/models/shared_link.rb`, `app/javascript/maps_maplibre/utils/settings_manager.js`); pricing https://dawarich.app/pricing
- Immich: https://github.com/immich-app/immich/releases (v3.3.1) ; sharing https://docs.immich.app/features/sharing
- GitHub topic searches: https://github.com/topics/trip-planner , https://github.com/topics/travel-planner
- Polarsteps: https://www.polarsteps.com/ , https://www.polarsteps.com/plus
- Wanderlog: https://wanderlog.com/ ; pricing (secondary) https://monkeyeatingmango.com/blog/wanderlog-pricing-2026/ ; TikTok import (secondary) https://getplotline.app/blog/plotline-vs-wanderlog
- TripIt Pro: https://www.tripit.com/web/pro
- Tripsy pricing: https://tripsy.help/article/21-whats-the-price-of-premium
- Stippl: https://www.stippl.io/ , https://www.stippl.io/pro
- Mapstr: https://en.mapstr.com/ , https://en.mapstr.com/faq
- Roadtrippers memberships: https://support.roadtrippers.com/hc/en-us/articles/360000831566-What-features-are-included-with-Roadtrippers-memberships
- Google My Maps sharing: https://support.google.com/mymaps/answer/3109452
- Tailscale Funnel: https://tailscale.com/kb/1223/funnel ; device sharing: https://tailscale.com/kb/1084/sharing
