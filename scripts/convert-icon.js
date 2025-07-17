const sharp = require('sharp');
sharp('assets/trayIcon.svg')
  .resize(16, 16)           // target size
  .png({ background: 'transparent' })
  .toFile('assets/trayIcon.png')
  .then(() => console.log('✅ trayIconTemplate.png created (16×16)'))
  .catch(err => console.error(err));
