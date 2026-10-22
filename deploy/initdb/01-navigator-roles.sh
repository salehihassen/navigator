#!/usr/bin/env bash
# Creates the Navigator database and its two roles. Runs once on a fresh volume
# (mounted into /docker-entrypoint-initdb.d) and in CI; safe to re-run.
#
#   navigator_owner  owns the database and the app schema; used only by migrations
#   navigator_app    runtime login: data access only, NOBYPASSRLS, owns nothing
#
# Passwords come from the environment; nothing is hard-coded.
set -euo pipefail
: "${NAVIGATOR_DB_OWNER_PASSWORD:?set NAVIGATOR_DB_OWNER_PASSWORD}"
: "${NAVIGATOR_DB_APP_PASSWORD:?set NAVIGATOR_DB_APP_PASSWORD}"
DB="${NAVIGATOR_DB_NAME:-navigator}"

psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER:-postgres}" --dbname postgres \
  -v owner_pw="$NAVIGATOR_DB_OWNER_PASSWORD" -v app_pw="$NAVIGATOR_DB_APP_PASSWORD" -v db="$DB" <<'SQL'
SELECT format('CREATE ROLE navigator_owner LOGIN PASSWORD %L', :'owner_pw')
 WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'navigator_owner') \gexec
SELECT format('CREATE ROLE navigator_app LOGIN NOBYPASSRLS PASSWORD %L', :'app_pw')
 WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'navigator_app') \gexec
SELECT format('CREATE DATABASE %I OWNER navigator_owner', :'db')
 WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = :'db') \gexec
SQL

psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER:-postgres}" --dbname "$DB" -v db="$DB" <<'SQL'
-- nobody but the owner creates objects; the app role only connects
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON DATABASE :"db" FROM PUBLIC;
GRANT CONNECT, TEMPORARY ON DATABASE :"db" TO navigator_app;
SQL
