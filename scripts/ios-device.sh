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
rm -f "$ROOT/ios/.xcode.env.local"

IP=""
for iface in en0 en1 en2 en3; do
  IP="$(ipconfig getifaddr "$iface" 2>/dev/null || true)"
  [[ -n "$IP" ]] && break
done

echo ""
echo "Hexli - Wi-Fi device run"
echo "  Metro port: $METRO_PORT"
if [[ -n "$IP" ]]; then
  echo "  Mac IP:     $IP"
  echo ""
  echo "Before opening the app, test on your iPhone in Safari:"
  echo "  http://$IP:$METRO_PORT/status"
  echo "  Expected:   packager-status:running"
  echo ""
  echo "If Safari cannot load that page:"
  echo "  • Phone + Mac must be on the same Wi-Fi (not guest Wi-Fi)"
  echo "  • Settings → Privacy & Security → Local Network → Hexli → ON"
  echo "  • Or use USB instead: npm run ios:device:usb"
else
  echo "  Mac IP:     (not found — connect to Wi-Fi first)"
fi
echo ""
echo "After install: keep this terminal open, then open Hexli or run npm run ios:launch"
echo ""

exec npx expo run:ios --device --port "$METRO_PORT" "$@"
