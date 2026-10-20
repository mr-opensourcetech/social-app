#!/usr/bin/env bash
# Runs as the unprivileged deploy user. Only service restart uses sudo.
set -euo pipefail
revision="${1:?A full Git commit is required}"
[[ "$revision" =~ ^[a-f0-9]{40}$ ]] || { echo "Invalid revision" >&2; exit 1; }
cd "${BLUESKY_DEPLOY_ROOT:-/opt/bluesky}"
exec 9>.deploy.lock
flock -n 9 || { echo "Another deployment is running" >&2; exit 1; }
test -x "releases/$revision/bskyweb"
previous="$(readlink current || true)"
next="current.next.$$"
trap 'rm -f "$next"' EXIT
ln -s "releases/$revision" "$next"
mv -Tf "$next" current

healthy() {
  for _ in $(seq 1 20); do
    if curl --fail --silent --max-time 5 http://127.0.0.1:8100/ > /dev/null; then
      return 0
    fi
    sleep 2
  done
  return 1
}

if sudo -n /usr/bin/systemctl restart bskyweb.service && healthy; then
  echo "Activated $revision"
  exit 0
fi

echo "Release failed its health check" >&2
if [ -n "$previous" ]; then
  ln -s "$previous" "$next"
  mv -Tf "$next" current
  sudo -n /usr/bin/systemctl restart bskyweb.service
  healthy || { echo "Rollback also failed its health check" >&2; exit 1; }
  echo "Restored previous release" >&2
else
  rm -f current
  echo "No previous release exists; inspect the service logs" >&2
fi
exit 1
