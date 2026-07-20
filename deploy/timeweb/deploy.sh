#!/usr/bin/env bash
set -euo pipefail

server=${PB_TIMEWEB_SERVER:-root@72.56.8.42}
identity_file=${PB_TIMEWEB_IDENTITY_FILE:-$HOME/.ssh/padel_brazzers_timeweb_deploy_ed25519}
project_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
bundled_node_dir=/Users/eduard25rus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin

if ! command -v node >/dev/null 2>&1 && [[ -x "$bundled_node_dir/node" ]]; then
  export PATH="$bundled_node_dir:$PATH"
fi
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required for tests and the production build" >&2
  exit 1
fi

cd "$project_root"

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Refusing deploy: tracked changes must be committed first" >&2
  exit 1
fi

release_sha=$(git rev-parse HEAD)
git merge-base --is-ancestor "$release_sha" origin/main || {
  echo "Refusing deploy: release SHA is not present on origin/main" >&2
  exit 1
}

pnpm test
pnpm build

temporary_dir=$(mktemp -d)
trap 'rm -rf "$temporary_dir"' EXIT
archive_path="$temporary_dir/$release_sha.tar.gz"
git archive --format=tar.gz --output="$archive_path" "$release_sha"

ssh_options=(-i "$identity_file" -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new)
remote_archive="/srv/padel-brazzers/state/incoming/$release_sha.tar.gz"
scp "${ssh_options[@]}" "$archive_path" "$server:$remote_archive"
ssh "${ssh_options[@]}" "$server" "/srv/padel-brazzers/config/release.sh '$release_sha' '$remote_archive'"
