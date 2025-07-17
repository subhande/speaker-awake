#!/bin/bash

# Build script for Audio Keepalive

echo "🔧 Building Audio Keepalive..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf build/

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Generate icons
echo "🎨 Generating icons..."
node scripts/build-icons.js

# Create .icns file for macOS (requires iconutil)
if command -v iconutil &> /dev/null; then
  echo "🍎 Creating macOS icon..."
  iconutil -c icns assets/icons/icon.iconset
  mv icon.icns assets/
fi

# Build the app
echo "🚀 Building application..."
npm run build

echo "✅ Build complete! Check the dist/ folder for your installer."
