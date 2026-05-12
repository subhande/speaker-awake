#!/usr/bin/env bash
# Builds a Release .app and packages it into a distributable DMG.
# Usage: ./build-dmg.sh [VERSION]
# Example: ./build-dmg.sh 0.0.2
set -euo pipefail

VERSION="${1:-0.0.2}"
PROJECT="SpeakerAwake.xcodeproj"
SCHEME="SpeakerAwake"
DERIVED_DATA="build/DerivedData"
APP_PATH="${DERIVED_DATA}/Build/Products/Release/SpeakerAwake.app"
DMG_OUTPUT="build/SpeakerAwake-${VERSION}.dmg"

# Require create-dmg
if ! command -v create-dmg &>/dev/null; then
  echo "Error: create-dmg not found. Install with: brew install create-dmg" >&2
  exit 1
fi

echo "==> Building Release .app (version ${VERSION})..."
xcodebuild \
  -project "$PROJECT" \
  -scheme "$SCHEME" \
  -configuration Release \
  -derivedDataPath "$DERIVED_DATA" \
  clean build \
  | xcpretty 2>/dev/null || true

if [ ! -d "$APP_PATH" ]; then
  echo "Error: Build failed — $APP_PATH not found." >&2
  exit 1
fi

mkdir -p build

echo "==> Creating DMG..."
# Remove stale DMG if it exists (create-dmg will not overwrite)
[ -f "$DMG_OUTPUT" ] && rm "$DMG_OUTPUT"

create-dmg \
  --volname "Speaker Awake" \
  --window-pos 200 120 \
  --window-size 600 400 \
  --icon-size 100 \
  --icon "SpeakerAwake.app" 175 190 \
  --hide-extension "SpeakerAwake.app" \
  --app-drop-link 425 190 \
  "$DMG_OUTPUT" \
  "$APP_PATH"

echo ""
echo "==> Done: $DMG_OUTPUT"
echo ""
echo "Next steps for public distribution:"
echo "  Notarize: xcrun notarytool submit \"$DMG_OUTPUT\" --keychain-profile notarytool-profile --wait"
echo "  Staple:   xcrun stapler staple \"$DMG_OUTPUT\""
echo "  Release:  gh release create v${VERSION} \"$DMG_OUTPUT\" --title \"v${VERSION}\" --notes-file CHANGELOG.md"
