#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f "$ROOT/.nvmrc" ]] && command -v nvm >/dev/null 2>&1; then
  # shellcheck disable=SC1090
  source "${NVM_DIR:-$HOME/.nvm}/nvm.sh"
  nvm use >/dev/null
fi

METRO_PORT="${EXPO_METRO_PORT:-8081}"

if ! command -v iproxy >/dev/null 2>&1; then
  echo "iproxy not found. Install it with:"
  echo "  brew install libimobiledevice"
  exit 1
fi

free_port() {
  local port="$1"
  local pids
  pids="$(lsof -ti ":$port" 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    echo "Stopping process on port $port..."
    kill -9 $pids 2>/dev/null || true
  fi
}

free_port "$METRO_PORT"
free_port 8082

# Skip writing the Mac LAN IP into ip.txt so the app falls back to localhost:8081.
cat > "$ROOT/ios/.xcode.env.local" <<EOF
export SKIP_BUNDLING_METRO_IP=1
EOF

iproxy "$METRO_PORT" "$METRO_PORT" &
IPROXY_PID=$!

cleanup() {
  kill "$IPROXY_PID" 2>/dev/null || true
  rm -f "$ROOT/ios/.xcode.env.local"
}
trap cleanup EXIT INT TERM

echo ""
echo "Hexli - USB device run"
echo "  Metro port: $METRO_PORT"
echo "  Mode:       localhost via iproxy (no Local Network permission needed)"
echo ""
echo "Requirements:"
echo "  • iPhone connected by USB cable"
echo "  • Trust this computer on the phone if prompted"
echo ""
echo "After install: keep this terminal open, then open Hexli or run npm run ios:launch"
echo ""

npx expo run:ios --device --port "$METRO_PORT" "$@"
