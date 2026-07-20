#!/usr/bin/env bash
set -euo pipefail

root_dir=/srv/padel-brazzers
store_path="$root_dir/data/auth-store.json"
backup_dir="$root_dir/backups"
lock_path="$root_dir/state/backup.lock"

mkdir -p "$backup_dir" "$root_dir/state"
exec 9>"$lock_path"
flock -w 30 9

if [[ ! -s "$store_path" ]]; then
  echo "Refusing backup: production store is missing or empty" >&2
  exit 1
fi

jq -e '
  (.users | type == "array") and
  (.forecastTournaments | type == "array") and
  (.forecastPredictions | type == "array") and
  (.completedTournamentResults | type == "array")
' "$store_path" >/dev/null

timestamp=$(date -u +%Y%m%dT%H%M%SZ)
temporary_path="$backup_dir/.auth-store-$timestamp.json.tmp"
backup_path="$backup_dir/auth-store-$timestamp.json"
manifest_path="$backup_path.manifest"

install -m 600 "$store_path" "$temporary_path"
jq -e . "$temporary_path" >/dev/null
mv "$temporary_path" "$backup_path"

store_sha=$(sha256sum "$backup_path" | awk '{print $1}')
jq -n \
  --arg created_at "$timestamp" \
  --arg sha256 "$store_sha" \
  --argjson users "$(jq '.users | length' "$backup_path")" \
  --argjson tournaments "$(jq '.forecastTournaments | length' "$backup_path")" \
  --argjson predictions "$(jq '.forecastPredictions | length' "$backup_path")" \
  --argjson results "$(jq '.completedTournamentResults | length' "$backup_path")" \
  '{created_at: $created_at, sha256: $sha256, counts: {users: $users, forecast_tournaments: $tournaments, forecast_predictions: $predictions, completed_results: $results}}' \
  >"$manifest_path"
chmod 600 "$manifest_path"

find "$backup_dir" -maxdepth 1 -type f -name 'auth-store-*.json' -mtime +30 -delete
find "$backup_dir" -maxdepth 1 -type f -name 'auth-store-*.json.manifest' -mtime +30 -delete

echo "$backup_path"
