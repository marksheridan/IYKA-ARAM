#!/usr/bin/env bash
#
# IYKA-ARAM — deploy the current main branch.
#
#   ssh iyka@<droplet-ip> '/srv/iyka-web/deploy/deploy.sh'
#
# Builds into a fresh .next and restarts the service. The site blinks for the
# couple of seconds systemd takes to restart; for a clinic brochure site that is
# an acceptable trade against the complexity of running two ports behind nginx.

set -euo pipefail

APP_DIR=/srv/iyka-web
SERVICE=iyka-web

cd "$APP_DIR"

echo "▸ Fetching…"
git fetch origin main
BEFORE=$(git rev-parse HEAD)
git reset --hard origin/main
AFTER=$(git rev-parse HEAD)

if [ "$BEFORE" = "$AFTER" ]; then
  echo "  already at $(git log -1 --oneline)"
else
  echo "  $(git log --oneline "$BEFORE".."$AFTER" | wc -l) new commit(s)"
fi

echo "▸ Installing dependencies…"
# npm ci is the reproducible install — it obeys package-lock.json exactly and
# removes anything not in it, so the server can never drift from the lockfile.
npm ci

echo "▸ Building…"
# The 2GB droplet builds this comfortably only with swap enabled (see the
# runbook). If the build is ever OOM-killed, that is the first thing to check.
npm run build

echo "▸ Restarting ${SERVICE}…"
sudo systemctl restart "$SERVICE"

# Wait for the app to actually answer before declaring success — a unit that is
# "active" can still be seconds away from serving.
echo "▸ Waiting for the site to respond…"
for i in $(seq 1 30); do
  if curl -sf -o /dev/null http://127.0.0.1:3000/; then
    echo "✓ Deployed: $(git log -1 --oneline)"
    exit 0
  fi
  sleep 1
done

echo "✗ The app did not respond within 30s. Recent logs:" >&2
sudo journalctl -u "$SERVICE" -n 40 --no-pager >&2
exit 1
