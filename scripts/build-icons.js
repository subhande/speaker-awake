const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'assets', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes for macOS
const macSizes = [16, 32, 64, 128, 256, 512, 1024];

// Input icon (you can replace this with a better source image)
const inputIcon = path.join(__dirname, '..', 'assets', 'trayIcon.png');

async function generateIcons() {
  try {
    // Generate PNG icons for macOS
    for (const size of macSizes) {
      await sharp(inputIcon)
        .resize(size, size)
        .png()
        .toFile(path.join(iconsDir, `icon_${size}x${size}.png`));

      // Also create @2x versions for retina displays
      await sharp(inputIcon)
        .resize(size * 2, size * 2)
        .png()
        .toFile(path.join(iconsDir, `icon_${size}x${size}@2x.png`));
    }

    // Create iconset for macOS
    const iconsetDir = path.join(iconsDir, 'icon.iconset');
    if (!fs.existsSync(iconsetDir)) {
      fs.mkdirSync(iconsetDir, { recursive: true });
    }

    // Copy icons to iconset
    for (const size of macSizes) {
      if (size <= 512) {
        fs.copyFileSync(
          path.join(iconsDir, `icon_${size}x${size}.png`),
          path.join(iconsetDir, `icon_${size}x${size}.png`)
        );
        fs.copyFileSync(
          path.join(iconsDir, `icon_${size}x${size}@2x.png`),
          path.join(iconsetDir, `icon_${size}x${size}@2x.png`)
        );
      }
    }

    console.log('Icons generated successfully!');
    console.log('To create .icns file, run: iconutil -c icns assets/icons/icon.iconset');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
