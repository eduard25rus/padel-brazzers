#!/usr/bin/env bash
set -euo pipefail

incoming_dir=/srv/padel-brazzers/state/incoming
release_script=/srv/padel-brazzers/config/release.sh
command=${SSH_ORIGINAL_COMMAND:-}

if [[ "$command" =~ ^scp\ -t\ /srv/padel-brazzers/state/incoming/([0-9a-f]{40})\.tar\.gz$ ]]; then
  exec scp -t "$incoming_dir/${BASH_REMATCH[1]}.tar.gz"
fi

if [[ "$command" =~ ^/srv/padel-brazzers/config/release\.sh\ \'([0-9a-f]{40})\'\ \'/srv/padel-brazzers/state/incoming/([0-9a-f]{40})\.tar\.gz\'$ ]]; then
  release_sha=${BASH_REMATCH[1]}
  archive_sha=${BASH_REMATCH[2]}
  if [[ "$release_sha" == "$archive_sha" ]]; then
    exec "$release_script" "$release_sha" "$incoming_dir/$archive_sha.tar.gz"
  fi
fi

echo "Command not permitted for the Padel Brazzers deployment key" >&2
exit 126
