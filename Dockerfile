# syntax=docker/dockerfile:1.7
# Navigator: one image serving the API and the built single-page app.
# Built in CI and pulled by the server; contains no configuration or secrets.

FROM node:26.12.1-alpine3.24 AS web
WORKDIR /web
# Node 25+ no longer bundles corepack; it installs the pnpm pinned in package.json
RUN npm install -g corepack@0.36.0 && corepack enable
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend/ ./
RUN pnpm build

FROM python:3.14.9-slim-trixie AS build
COPY --from=ghcr.io/astral-sh/uv:0.12.3 /uv /bin/uv
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy UV_PYTHON_DOWNLOADS=never UV_PROJECT_ENVIRONMENT=/app/.venv
WORKDIR /src
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --locked --no-dev --no-install-project
COPY backend/src ./src
RUN uv sync --locked --no-dev --no-editable

FROM python:3.14.9-slim-trixie
LABEL org.opencontainers.image.source="https://github.com/salehihassen/navigator" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.description="Navigator: a multi-tenant atlas of past, planned and someday trips"
RUN useradd --system --uid 10001 --no-create-home --shell /usr/sbin/nologin navigator
COPY --from=build /app/.venv /app/.venv
COPY --from=web /web/dist /app/static
ENV PATH=/app/.venv/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    NAVIGATOR_ENV=prod \
    NAVIGATOR_STATIC_DIR=/app/static
USER 10001
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD ["python", "-c", "import urllib.request,sys; sys.exit(urllib.request.urlopen('http://127.0.0.1:8000/healthz', timeout=2).status != 200)"]
CMD ["navigator", "serve", "--host", "0.0.0.0", "--port", "8000"]
