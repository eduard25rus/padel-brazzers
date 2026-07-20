#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: release.sh <git-sha> <archive-path>" >&2
  exit 64
fi

release_sha=$1
archive_path=$2
root_dir=/srv/padel-brazzers
release_dir="$root_dir/app/releases/$release_sha"
compose_path="$root_dir/config/compose.timeweb.yml"
environment_path="$root_dir/config/timeweb.env"
current_release_path="$root_dir/state/current-release"
previous_release_path="$root_dir/state/previous-release"
image="padel-brazzers:$release_sha"

if [[ ! "$release_sha" =~ ^[0-9a-f]{40}$ ]]; then
  echo "Release must be a full Git SHA" >&2
  exit 64
fi
if [[ ! -f "$archive_path" ]]; then
  echo "Release archive does not exist: $archive_path" >&2
  exit 66
fi

exec 9>"$root_dir/state/deploy.lock"
flock -w 60 9

previous_sha=""
if [[ -f "$current_release_path" ]]; then
  previous_sha=$(tr -d '[:space:]' <"$current_release_path")
fi

"$root_dir/config/backup.sh" >/dev/null

mkdir -p "$release_dir"
tar -xzf "$archive_path" -C "$release_dir"
docker build --pull --tag "$image" "$release_dir"
install -m 644 "$release_dir/compose.timeweb.yml" "$compose_path"

if [[ ! -f "$environment_path" ]]; then
  install -m 600 /dev/null "$environment_path"
fi
sed -i '/^PB_IMAGE=/d' "$environment_path"
printf 'PB_IMAGE=%s\n' "$image" >>"$environment_path"

if ! docker compose --env-file "$environment_path" -f "$compose_path" up -d --no-build --remove-orphans; then
  if [[ -n "$previous_sha" ]] && docker image inspect "padel-brazzers:$previous_sha" >/dev/null 2>&1; then
    sed -i '/^PB_IMAGE=/d' "$environment_path"
    printf 'PB_IMAGE=padel-brazzers:%s\n' "$previous_sha" >>"$environment_path"
    docker compose --env-file "$environment_path" -f "$compose_path" up -d --no-build --remove-orphans
  fi
  exit 1
fi

healthy=false
for _ in $(seq 1 30); do
  if curl --fail --silent --show-error http://127.0.0.1:8003/healthz >/dev/null; then
    healthy=true
    break
  fi
  sleep 2
done

if [[ "$healthy" != true ]]; then
  docker logs --tail 100 padel-brazzers-web >&2 || true
  if [[ -n "$previous_sha" ]] && docker image inspect "padel-brazzers:$previous_sha" >/dev/null 2>&1; then
    sed -i '/^PB_IMAGE=/d' "$environment_path"
    printf 'PB_IMAGE=padel-brazzers:%s\n' "$previous_sha" >>"$environment_path"
    docker compose --env-file "$environment_path" -f "$compose_path" up -d --no-build --remove-orphans
  fi
  exit 1
fi

if [[ -n "$previous_sha" ]]; then
  printf '%s\n' "$previous_sha" >"$previous_release_path"
fi
printf '%s\n' "$release_sha" >"$current_release_path"
rm -f "$archive_path"
echo "Released $release_sha"
