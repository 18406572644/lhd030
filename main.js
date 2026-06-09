const { app, BrowserWindow, ipcMain, Notification, screen } = require('electron');
const path = require('path');
const fs = require('fs');

const storePath = path.join(app.getPath('userData'), 'pet-store.json');

function loadStore() {
  try {
    if (fs.existsSync(storePath)) {
      return JSON.parse(fs.readFileSync(storePath, 'utf8'));
    }
  } catch (_) {}
  return {
    petState: 'idle',
    focusDuration: 25,
    windowX: undefined,
    windowY: undefined,
  };
}

function saveStore(data) {
  try {
    fs.writeFileSync(storePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (_) {}
}

let storeData = loadStore();

function storeGet(key) {
  return storeData[key];
}

function storeSet(key, value) {
  storeData[key] = value;
  saveStore(storeData);
}

let mainWindow = null;
let focusTimeout = null;

function createWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  const savedX = storeGet('windowX');
  const savedY = storeGet('windowY');

  mainWindow = new BrowserWindow({
    width: 200,
    height: 200,
    x: savedX !== undefined ? savedX : screenWidth - 250,
    y: savedY !== undefined ? savedY : screenHeight - 250,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('renderer.html');
  mainWindow.setIgnoreMouseEvents(false);

  mainWindow.on('moved', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      const [x, y] = mainWindow.getPosition();
      storeSet('windowX', x);
      storeSet('windowY', y);
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('start-focus', (event, durationMinutes) => {
  storeSet('petState', 'sleeping');
  storeSet('focusDuration', durationMinutes);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('state-changed', 'sleeping', durationMinutes);
  }

  if (focusTimeout) clearTimeout(focusTimeout);
  focusTimeout = setTimeout(() => {
    storeSet('petState', 'alert');
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('state-changed', 'alert');
    }
    if (Notification.isSupported()) {
      const notification = new Notification({
        title: '番茄钟',
        body: '专注完成，休息一下吧',
      });
      notification.show();
    }
    focusTimeout = null;
  }, durationMinutes * 60 * 1000);
});

ipcMain.on('stop-focus', () => {
  storeSet('petState', 'idle');
  if (focusTimeout) {
    clearTimeout(focusTimeout);
    focusTimeout = null;
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('state-changed', 'idle');
  }
});

ipcMain.on('reset-position', () => {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setPosition(sw - 250, sh - 250);
    storeSet('windowX', sw - 250);
    storeSet('windowY', sh - 250);
  }
});

ipcMain.on('quit', () => {
  app.quit();
});

ipcMain.handle('get-store', (event, key) => {
  return storeGet(key);
});

ipcMain.on('move-window', (event, deltaX, deltaY) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const [x, y] = mainWindow.getPosition();
    mainWindow.setPosition(x + deltaX, y + deltaY);
  }
});
