# Padel Brazzers on Timeweb Cloud

The Timeweb deployment is isolated under `/srv/padel-brazzers` and binds only to
`127.0.0.1:8003`. Caddy is the only public entry point. Railway remains the
rollback source during the migration window and must not be deleted without
explicit approval.

## Server layout

- `app/releases/<git-sha>` — immutable release sources
- `data/auth-store.json` — persistent production store; never replaced by a code deploy
- `backups` — daily and pre-deploy store backups with SHA256/count manifests
- `config` — Compose, release and backup scripts, server-only environment
- `state/current-release` — exact deployed Git SHA

`REQUIRE_EXISTING_STORE=true` makes the container fail closed when the store is
missing or malformed. The `/healthz` check also parses the store.

## Normal deployment from Codex

1. Run tests and commit the intended tracked changes only.
2. Push the commit to `origin/main`.
3. Run `deploy/timeweb/deploy.sh`.

The deployment builds an image tagged with the full Git SHA, creates a backup,
starts the replacement container, checks health and rolls back to the previous
image if health does not recover. It never copies a database/store from the
repository.

## Backups

`/srv/padel-brazzers/config/backup.sh` validates JSON and required collections,
writes a mode-0600 snapshot plus a manifest, and retains 30 days. A systemd
timer runs it daily. Every deployment also runs it first.

## Migration and DNS cutover

The parallel test URL is `https://padel-brazzers-test.72-56-8-42.sslip.io`.
Keep `www.padelbrazzers.ru` on Railway until the test copy is approved.

At cutover, prevent writes on Railway, take a final consistent export, verify
SHA256 and collection counts, back up the Timeweb copy, replace only
`/srv/padel-brazzers/data/auth-store.json`, restart and verify `/healthz`.
Then change only the `www` A record to `72.56.8.42`; do not alter NS, MX, the
apex site, or other records. Keep Railway stopped but recoverable for at least
several stable days and delete it only with explicit approval.
