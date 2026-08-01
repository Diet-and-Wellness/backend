#!/usr/bin/env bash
set -Eeuo pipefail

readonly SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly APP_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
readonly BRANCH="main"
readonly HEALTH_URL="http://127.0.0.1:5000/api/health"

stage() { printf '\n==> %s\n' "$1"; }

# GitHub Actions SSH sessions are non-interactive, so initialize the deploy
# user's NVM explicitly instead of relying on shell profile files.
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
  echo "NVM was not found at $NVM_DIR" >&2
  exit 1
fi
# shellcheck source=/dev/null
. "$NVM_DIR/nvm.sh"

stage "Entering application directory"
cd "$APP_DIR"
nvm install
nvm use

stage "Updating checkout to origin/$BRANCH"
git fetch --prune origin "$BRANCH"
# This resets tracked files only. Ignored production .env and backups remain.
git reset --hard "origin/$BRANCH"

stage "Installing locked dependencies"
npm ci --omit=dev

stage "Validating backend source"
npm run build

# Mongoose manages schemas at runtime and this repository has no migration
# framework or safe production migration command. Seeds are intentionally not run.
stage "Starting or reloading PM2 process"
mkdir -p logs backups
pm2 startOrReload ecosystem.config.cjs --update-env

stage "Checking local API health"
healthy=false
for attempt in {1..15}; do
  if curl --fail --silent --show-error "$HEALTH_URL" >/dev/null; then
    healthy=true
    break
  fi
  sleep 2
done
if [[ "$healthy" != true ]]; then
  pm2 logs backend --lines 80 --nostream || true
  echo "Health check failed: $HEALTH_URL" >&2
  exit 1
fi

pm2 status backend
stage "Deployment completed"
