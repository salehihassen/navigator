# Setting up Navigator

There are three places to configure, in this order:

1. GitHub, which runs CI and publishes the image.
2. WorkOS, which handles sign-in.
3. Wherever it runs: your machine for development, or a single VPS for production.

No secret ever goes into the repository. Every credential lives in a private env
file, or in the WorkOS and GitHub dashboards.

## 1. GitHub (repo, CI, images)

1. Create a **public** repository named `navigator`. Leave it empty: no README,
   license or .gitignore, because the repo already has them.
2. Push `main`. The **CI** workflow does four things:
   - runs backend lint, types and tests against Postgres 18 and Garage
   - type-checks and builds the frontend
   - scans the full git history with gitleaks
   - builds the image
   On pushes to `main` and `v*` tags it publishes `ghcr.io/<owner>/navigator` using the
   built-in `GITHUB_TOKEN`. No repository secrets are needed.
3. In **Settings → Code security**, turn on Dependabot alerts, secret scanning and
   push protection. They're free for public repositories.
4. In **Settings → Actions → General → Workflow permissions**, choose **Read
   repository contents**. The workflows request anything more themselves.
5. In **Settings → Rules**, add a ruleset for `main`: require a pull request and
   the `backend`, `frontend`, `secrets` and `image` checks, and block force pushes.
6. After the first image is published, open the package
   (**Your profile → Packages → navigator → Package settings**) and set its
   visibility to **Public**. The server can then pull it without logging in. If you'd
   rather keep the package private, run `docker login ghcr.io` on the server with a
   token that only has `read:packages`.

Enable the local secret-scanning hook once per clone:

```sh
git config core.hooksPath scripts/hooks
```

## 2. WorkOS (sign-in)

Create two WorkOS environments: **Staging** for local development and **Production**
for the server. In each one:

1. Under **Authentication**, enable **Google OAuth** and **Magic Auth** (email
   codes). Leave Apple for later.
   - Staging can use WorkOS's built-in demo Google credentials.
   - Production needs your own Google OAuth client. In Google Cloud Console, go to
     **APIs & Services → Credentials → OAuth client ID (Web)** and set the authorized
     redirect URI to the one WorkOS shows on its Google settings page. Then paste the
     client ID and secret into WorkOS. In Google's OAuth consent screen, set the app
     name to Navigator and add your privacy and terms URLs.
2. Under **Redirects**, add:
   - **Sign-in callback:** `<public url>/auth/callback`. Locally that's
     `http://localhost:5173/auth/callback`; Vite forwards `/auth` to the backend.
   - **Sign-out redirect:** `<public url>/`
   - **App homepage URL:** `<public url>/`
3. Under **Branding**, set the name to Navigator, add a logo, and add links to
   `<public url>/privacy` and `<public url>/terms`.
4. Under **API Keys**, copy that environment's API key and Client ID into the matching env
   file: `.dev/navigator.env` locally, or the server's `navigator.env`.

Sign-in is wired up in M1. Until then the keys can stay empty.

## 3a. Local development

Requires Docker, [uv](https://docs.astral.sh/uv/), Node 24 and pnpm 10.

```sh
scripts/dev-up        # first run writes .dev/navigator.env (gitignored) with random local passwords
scripts/dev-backend   # migrate, then the API on http://127.0.0.1:8930 with reload
cd frontend && pnpm install && pnpm dev   # app on http://localhost:5173
scripts/dev-test      # ruff, mypy, pytest (database and storage tests included)
```

- Everything runs in the Compose project **`navigator-dev`**: `navigator-dev-db` on
  127.0.0.1:5450 and `navigator-dev-storage` (Garage S3) on 127.0.0.1:9450. If either
  port is taken, `scripts/dev-up` stops and tells you. You can change the ports in
  `.dev/navigator.env`.
- `scripts/dev-down` stops the containers and keeps the data.
- `scripts/dev-reset` deletes the `navigator-dev` containers and volumes, and nothing
  else. It asks you to type the project name first.
- None of the scripts run `docker system prune` or touch other Compose projects.

## 3b. Production on one VPS

The layout below is an example. It assumes the server's Compose file is at
`~/server/docker-compose.yaml`, with Navigator's data next to it in `~/server/navigator`.

```sh
# 1. code (for the init SQL, Garage config and scripts; the app itself comes from GHCR)
git clone https://github.com/<owner>/navigator ~/repos/navigator

# 2. secrets: three env files, one per service, mode 600, never committed
~/repos/navigator/scripts/new-prod-env ~/server/navigator \
  https://navigator.example.com https://files.navigator.example.com
$EDITOR ~/server/navigator/navigator.env      # paste the WorkOS *production* keys

# 3. services: copy the three services from deploy/prod/compose.example.yaml into
#    ~/server/docker-compose.yaml (set NAVIGATOR_REPO if the repo lives elsewhere)

# 4. first start: the database creates its roles on an empty volume
cd ~/server
docker compose up -d navigator-db navigator-storage
set -a; . ./navigator/navigator.env; set +a
~/repos/navigator/scripts/garage-init navigator-storage
docker compose run --rm navigator navigator migrate
docker compose up -d navigator
curl -fsS http://127.0.0.1:8091/readyz
```

Then:

- **DNS:** point A and AAAA records for `navigator.example.com` and
  `files.navigator.example.com` at the server.
- **Caddy:** add the two site blocks from `deploy/prod/Caddyfile.example`. They handle
  TLS, HSTS, size limits, and a sandboxed origin for user files.
- **Firewall:** allow only 22, 80 and 443 inbound. Postgres is never published, and
  Garage's S3 port is bound to 127.0.0.1 for Caddy only.

**Updating to a new release:**

```sh
cd ~/server
NAVIGATOR_TAG=1.2.3 docker compose pull navigator
NAVIGATOR_TAG=1.2.3 docker compose run --rm navigator navigator migrate
NAVIGATOR_TAG=1.2.3 docker compose up -d navigator
```

Migrations only add things, so rolling back means running the previous tag. Backups
(nightly `pg_dump` plus an offsite copy of `navigator/media`) arrive with M3.
