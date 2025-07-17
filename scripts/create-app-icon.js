const sharp = require('sharp');
const path = require('path');

async function createAppIcon() {
  const inputIcon = path.join(__dirname, '..', 'assets', 'trayIcon.png');
  const outputIcon = path.join(__dirname, '..', 'assets', 'app-icon.png');

  try {
    // Get the original image info
    const image = sharp(inputIcon);
    const metadata = await image.metadata();

    console.log(`Original icon size: ${metadata.width}x${metadata.height}`);

    // Create a 512x512 icon with padding if needed
    await image
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
      })
      .png()
      .toFile(outputIcon);

    console.log('✅ App icon created successfully at assets/app-icon.png');

    // Also create the iconset directory structure for macOS
    const iconsetDir = path.join(__dirname, '..', 'assets', 'app-icon.iconset');
    const fs = require('fs');

    if (!fs.existsSync(iconsetDir)) {
      fs.mkdirSync(iconsetDir, { recursive: true });
    }

    // Generate all required macOS icon sizes
    const sizes = [16, 32, 64, 128, 256, 512];

    for (const size of sizes) {
      await sharp(outputIcon)
        .resize(size, size)
        .png()
        .toFile(path.join(iconsetDir, `icon_${size}x${size}.png`));
    }

    console.log('✅ IconSet created for macOS');

  } catch (error) {
    console.error('Error creating app icon:', error);
  }
}

createAppIcon();
