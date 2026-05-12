# Setup, Running & Distribution Guide

Step-by-step instructions for setting up the development environment, running the app locally, and packaging it as a distributable DMG.

---

## 1. Prerequisites

Install the following before proceeding.

### Xcode

Download from the Mac App Store or [developer.apple.com](https://developer.apple.com/xcode/).  
Minimum version: **Xcode 15.0**

```bash
# Verify installation
xcode-select -p          # should print a path to Xcode or CLT
xcodebuild -version      # should print Xcode 15.x or later
```

### Command Line Tools (if using CLI only)

```bash
xcode-select --install
```

### create-dmg (for DMG packaging)

```bash
brew install create-dmg
```

---

## 2. Clone & Open

```bash
git clone <repo-url>
cd speaker-awake
open SpeakerAwake.xcodeproj
```

Xcode opens the project automatically. No `pod install` or `swift package resolve` is needed — the app has no third-party dependencies.

---

## 3. Configure Signing

Speaker Awake uses **automatic signing**.

1. In Xcode, select the **SpeakerAwake** project in the navigator.
2. Select the **SpeakerAwake** target → **Signing & Capabilities**.
3. Set **Team** to your Apple Developer account (free or paid).
4. Xcode manages provisioning profiles automatically.

> For local development and testing, a free Apple ID works fine.  
> For notarization and distribution outside the App Store, a paid Apple Developer account ($99/yr) is required.

---

## 4. Run in Development

### From Xcode

Press **⌘R** (or **Product → Run**).

The app has no Dock icon (`LSUIElement = YES`). Look for the speaker icon in the **menu bar** (top-right area of the screen).

### From the command line

```bash
xcodebuild \
  -project SpeakerAwake.xcodeproj \
  -scheme SpeakerAwake \
  -configuration Debug \
  -derivedDataPath build/DerivedData \
  build

# Run the built app
open build/DerivedData/Build/Products/Debug/SpeakerAwake.app
```

---

## 5. Build a Release Binary

```bash
xcodebuild \
  -project SpeakerAwake.xcodeproj \
  -scheme SpeakerAwake \
  -configuration Release \
  -derivedDataPath build/DerivedData \
  clean build
```

The release `.app` is written to:

```
build/DerivedData/Build/Products/Release/SpeakerAwake.app
```

---

## 6. Notarize the App (Optional — Required for Distribution)

Notarization is required to distribute outside the App Store without macOS Gatekeeper warnings.

### 6.1 Archive

In Xcode: **Product → Archive**  
Or via CLI:

```bash
xcodebuild \
  -project SpeakerAwake.xcodeproj \
  -scheme SpeakerAwake \
  -configuration Release \
  -archivePath build/SpeakerAwake.xcarchive \
  archive
```

### 6.2 Export the .app

```bash
xcodebuild \
  -exportArchive \
  -archivePath build/SpeakerAwake.xcarchive \
  -exportPath build/export \
  -exportOptionsPlist ExportOptions.plist
```

Create `ExportOptions.plist` in the project root:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>developer-id</string>
  <key>teamID</key>
  <string>YOUR_TEAM_ID</string>
  <key>signingStyle</key>
  <string>automatic</string>
</dict>
</plist>
```

Replace `YOUR_TEAM_ID` with your 10-character Apple Developer Team ID (visible in Xcode → Signing & Capabilities, or at developer.apple.com/account).

### 6.3 Submit for Notarization

```bash
# Store credentials once (done once per machine)
xcrun notarytool store-credentials "notarytool-profile" \
  --apple-id "your@apple.id" \
  --team-id "YOUR_TEAM_ID" \
  --password "xxxx-xxxx-xxxx-xxxx"   # app-specific password from appleid.apple.com

# Submit
xcrun notarytool submit build/export/SpeakerAwake.app \
  --keychain-profile "notarytool-profile" \
  --wait
```

### 6.4 Staple the Ticket

```bash
xcrun stapler staple build/export/SpeakerAwake.app
```

---

## 7. Create a DMG

After building (and optionally notarizing) the `.app`, package it into a DMG for distribution.

### 7.1 Install create-dmg

```bash
brew install create-dmg
```

### 7.2 Create the DMG

```bash
APP_PATH="build/DerivedData/Build/Products/Release/SpeakerAwake.app"
# Use the notarized export path if you completed step 6:
# APP_PATH="build/export/SpeakerAwake.app"

create-dmg \
  --volname "Speaker Awake" \
  --volicon "$APP_PATH/Contents/Resources/AppIcon.icns" \
  --window-pos 200 120 \
  --window-size 600 400 \
  --icon-size 100 \
  --icon "SpeakerAwake.app" 175 190 \
  --hide-extension "SpeakerAwake.app" \
  --app-drop-link 425 190 \
  "build/SpeakerAwake-1.0.0.dmg" \
  "$APP_PATH"
```

The finished DMG is written to `build/SpeakerAwake-1.0.0.dmg`.

> If you haven't added a custom app icon to `Assets.xcassets`, omit the `--volicon` flag.

### 7.3 Notarize the DMG (if distributing publicly)

```bash
xcrun notarytool submit build/SpeakerAwake-1.0.0.dmg \
  --keychain-profile "notarytool-profile" \
  --wait

xcrun stapler staple build/SpeakerAwake-1.0.0.dmg
```

### 7.4 Verify the DMG

```bash
spctl --assess --type open --context context:primary-signature \
  build/SpeakerAwake-1.0.0.dmg
```

---

## 8. Full Release Checklist

```
[ ] Bump MARKETING_VERSION in Xcode build settings (or project.pbxproj)
[ ] Update CHANGELOG.md with the new version and date
[ ] Archive (Product → Archive or xcodebuild archive)
[ ] Export signed .app with ExportOptions.plist
[ ] Notarize .app
[ ] Staple .app
[ ] Create DMG with create-dmg
[ ] Notarize DMG
[ ] Staple DMG
[ ] Verify with spctl
[ ] Tag the release in git: git tag v1.0.0 && git push --tags
```

---

## 9. Troubleshooting

| Symptom | Fix |
|---|---|
| App doesn't appear in menu bar | Check `LSUIElement = YES` in Info.plist; make sure the build succeeded |
| "SpeakerAwake" is damaged (Gatekeeper) | Notarize and staple the app, or run `xattr -cr SpeakerAwake.app` for local testing |
| Launch at Login toggle has no effect | macOS may require user approval in **System Settings → General → Login Items** |
| Audio engine fails to start | Check Console.app for `AudioKeepAlive` errors; ensure no other app holds exclusive audio access |
| `xcodebuild` not found | Install Xcode (not just Command Line Tools); set active developer: `sudo xcode-select -s /Applications/Xcode.app` |
