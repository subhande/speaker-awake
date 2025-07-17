const { app, BrowserWindow, Tray, Menu, nativeImage, screen, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let win;
let tray;

function createWindow() {
  const window = new BrowserWindow({
    width: 400,
    height: 380, // Increased height for quit button
    show: false,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    fullscreenable: false,
    visibleOnAllWorkspaces: true,
    level: 'floating',
    type: 'panel',
    transparent: true,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    icon: path.join(__dirname, 'assets', 'trayIcon.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the HTML file
  window.loadFile(path.join(__dirname, 'index.html'));

  // Hide window when it loses focus
  window.on('blur', () => {
    if (!window.webContents.isDevToolsOpened()) {
      window.hide();
    }
  });

  window.on('close', e => {
    if (!app.isQuiting) {
      e.preventDefault();
      window.hide();
    }
  });

  return window;
}

function positionWindow() {
  if (!win || win.isDestroyed()) return;

  const trayBounds = tray.getBounds();
  const windowBounds = win.getBounds();
  const display = screen.getDisplayNearestPoint({
    x: trayBounds.x,
    y: trayBounds.y
  });

  // Calculate position
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));
  const y = Math.round(trayBounds.y + trayBounds.height + 4);

  // Make sure window stays on screen
  const maxX = display.workArea.x + display.workArea.width - windowBounds.width;
  const maxY = display.workArea.y + display.workArea.height - windowBounds.height;

  win.setPosition(
    Math.max(display.workArea.x, Math.min(x, maxX)),
    Math.max(display.workArea.y, Math.min(y, maxY))
  );

  // Force it to be visible on all workspaces and always on top
  win.setVisibleOnAllWorkspaces(true);
  win.setAlwaysOnTop(true, 'floating');
}

function showWindow() {
  // Create window only if it doesn't exist or was destroyed
  if (!win || win.isDestroyed()) {
    win = createWindow();

    // Wait for the window to be ready before positioning and showing
    win.webContents.once('did-finish-load', () => {
      positionWindow();
      win.show();
      win.focus();
    });
  } else {
    // Window exists, just position and show it
    positionWindow();
    win.show();
    win.focus();
  }
}

function toggleWindow() {
  if (win && !win.isDestroyed() && win.isVisible()) {
    win.hide();
  } else {
    showWindow();
  }
}

// Handle quit command from renderer
ipcMain.handle('quit-app', () => {
  app.isQuiting = true;
  app.quit();
});

app.whenReady().then(() => {
  // Hide Dock icon on macOS
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  // Create tray icon
  const pngIconPath = path.join(__dirname, 'assets', 'trayIcon.png');

  if (!fs.existsSync(pngIconPath)) {
    console.error('Tray icon file not found:', pngIconPath);
    return;
  }

  let trayImage = nativeImage.createFromPath(pngIconPath);
  trayImage.setTemplateImage(true);

  tray = new Tray(trayImage);
  tray.setToolTip('Audio Keepalive');

  tray.on('click', () => {
    toggleWindow();
  });

  // Create the window initially but don't show it
  win = createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  showWindow();
});
