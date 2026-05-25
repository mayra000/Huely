#!/usr/bin/env bash
set -euo pipefail

BUNDLE_ID="com.hexli.app"

if ! command -v xcrun >/dev/null 2>&1 || ! xcrun devicectl --version >/dev/null 2>&1; then
  echo "devicectl is unavailable. Open Hexli manually on your iPhone."
  exit 1
fi

json_file="$(mktemp)"
trap 'rm -f "$json_file"' EXIT

if ! xcrun devicectl list devices --json-output "$json_file" >/dev/null 2>&1; then
  echo "Could not list connected devices. Open Hexli manually on your iPhone."
  exit 1
fi

udid="$(
  node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'));
    const devices = data.result?.devices ?? [];
    const connected = devices.find((device) => {
      const transport = device.connectionProperties?.transportType;
      return transport === 'wired' || transport === 'localNetwork';
    });
    if (connected?.identifier) {
      process.stdout.write(String(connected.identifier));
    }
  " "$json_file"
)"

if [[ -z "$udid" ]]; then
  echo "No connected iPhone found. Plug in your device or open Hexli manually."
  exit 1
fi

echo "Launching $BUNDLE_ID..."
xcrun devicectl device process launch --terminate-existing --device "$udid" "$BUNDLE_ID"
