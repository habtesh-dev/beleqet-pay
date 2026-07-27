#!/usr/bin/env bash
# Beleqet Pay — automated build + package script.
# Installs deps, builds every workspace that has a build script, then
# compresses the whole monorepo into beleqet-pay-universe.zip at the repo root.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Installing workspace dependencies"
npm install

echo "==> Building all workspaces (api, dashboard, checkout-sdk)"
npm run build --workspaces --if-present

echo "==> Running API e2e tests (requires: docker compose up -d)"
npm run --workspace=apps/api test:e2e || echo "!! e2e tests failed or infra not running — inspect before deploying."

echo "==> Packaging monorepo into beleqet-pay-universe.zip"
cd "$ROOT_DIR/.."
zip -r -q beleqet-pay-universe.zip "$(basename "$ROOT_DIR")" \
  -x "*/node_modules/*" -x "*/dist/*" -x "*/.next/*" -x "*/.expo/*"

echo "==> Done: $(dirname "$ROOT_DIR")/beleqet-pay-universe.zip"
