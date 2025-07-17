# Building Audio Keepalive

This guide will help you build and create installers for Audio Keepalive.

## Prerequisites

- Node.js (v16 or higher)
- npm
- macOS (for building macOS installers)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install electron-builder:
```bash
npm install --save-dev electron-builder
```

## Building

### Generate Icons
```bash
npm run build-icons
```

### Build for macOS
```bash
npm run build:mac
```

### Build for all platforms
```bash
npm run build-all
```

## Output

The built applications will be in the `dist/` folder:

- **macOS**: `dist/Audio Keepalive-1.0.0.dmg` (installer)
- **macOS**: `dist/Audio Keepalive-1.0.0-mac.zip` (portable)

## Manual Steps

1. **Install electron-builder**:
```bash
npm install --save-dev electron-builder
```

2. **Generate icons** (optional - improve your icon first):
```bash
npm run build-icons
```

3. **Build the installer**:
```bash
npm run build:mac
```

## Customization

- Update `package.json` with your details (name, email, homepage)
- Replace `assets/trayIcon.png` with a better 512x512 icon
- Modify build configuration in `package.json` under the `build` section

## Distribution

The DMG installer will allow users to drag the app to their Applications folder. The app will run from the menu bar as a system tray application.

## Code Signing (Optional)

For distribution outside the App Store, you'll need to code sign the app:

1. Get a Developer ID certificate from Apple
2. Add signing configuration to `package.json`
3. Build with signing enabled

## Troubleshooting

- If you get permission errors, make sure the build script is executable:
```bash
chmod +x scripts/build.sh
```

- If icons don't generate properly, make sure you have a good quality source image at `assets/trayIcon.png`
```

To get started building your installer:

1. **Install electron-builder**:
```bash
cd audio-keepalive
npm install --save-dev electron-builder
```

2. **Build the installer**:
```bash
npm run build:mac
```

This will create a DMG installer in the `dist/` folder that users can download and install by dragging the app to their Applications folder
