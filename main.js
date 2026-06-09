const { app, BrowserWindow, ipcMain, Notification, screen } = require('electron');
const path = require('path');
const fs = require('fs');

const storePath = path.join(app.getPath('userData'), 'pet-store.json');

const DEFAULT_CONFIG = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartNext: false,
};

function loadStore() {
  const defaults = {
    petState: 'idle',
    pomodoroConfig: { ...DEFAULT_CONFIG },
    completedPomodoros: 0,
    currentPhase: 'idle',
    windowX: undefined,
    windowY: undefined,
    currentSkinId: 'orange',
    customSkins: [],
  };
  try {
    if (fs.existsSync(storePath)) {
      const data = JSON.parse(fs.readFileSync(storePath, 'utf8'));
      return {
        ...defaults,
        ...data,
        pomodoroConfig: { ...DEFAULT_CONFIG, ...(data.pomodoroConfig || {}) },
      };
    }
  } catch (_) {}
  return defaults;
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
let phaseTimeout = null;
let currentPhase = storeData.currentPhase || 'idle';
let completedPomodoros = storeData.completedPomodoros || 0;
let pomodoroConfig = storeData.pomodoroConfig || { ...DEFAULT_CONFIG };
let phaseEndTime = null;

function sendState(phase, extra) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send('state-changed', {
    phase,
    completedPomodoros,
    config: pomodoroConfig,
    endTime: phaseEndTime,
    ...extra,
  });
}

function getCatState(phase) {
  switch (phase) {
    case 'focusing': return 'sleeping';
    case 'short-break':
    case 'long-break': return 'resting';
    case 'alert': return 'alert';
    default: return 'idle';
  }
}

function startPhase(phase, durationMinutes) {
  if (phaseTimeout) clearTimeout(phaseTimeout);
  currentPhase = phase;
  phaseEndTime = Date.now() + durationMinutes * 60 * 1000;
  storeSet('currentPhase', phase);
  storeSet('petState', getCatState(phase));

  sendState(phase);

  phaseTimeout = setTimeout(() => {
    phaseTimeout = null;
    onPhaseComplete(phase);
  }, durationMinutes * 60 * 1000);
}

function onPhaseComplete(completedPhase) {
  if (completedPhase === 'focusing') {
    completedPomodoros++;
    storeSet('completedPomodoros', completedPomodoros);

    const isLongBreak = completedPomodoros % pomodoroConfig.longBreakInterval === 0;
    const breakPhase = isLongBreak ? 'long-break' : 'short-break';
    const breakDuration = isLongBreak
      ? pomodoroConfig.longBreakDuration
      : pomodoroConfig.shortBreakDuration;

    phaseEndTime = null;
    currentPhase = 'alert';
    storeSet('currentPhase', 'alert');
    storeSet('petState', 'alert');
    sendState('alert', { justCompleted: 'focusing' });

    if (Notification.isSupported()) {
      const notification = new Notification({
        title: '番茄钟',
        body: isLongBreak
          ? `完成了 ${completedPomodoros} 个番茄，开始长休息！`
          : `第 ${completedPomodoros} 个番茄完成，休息一下！`,
      });
      notification.show();
    }

    setTimeout(() => {
      if (currentPhase !== 'alert') return;
      startPhase(breakPhase, breakDuration);
    }, 3000);
  } else if (completedPhase === 'short-break' || completedPhase === 'long-break') {
    if (completedPhase === 'long-break') {
      completedPomodoros = 0;
      storeSet('completedPomodoros', 0);
    }

    phaseEndTime = null;
    currentPhase = 'idle';
    storeSet('currentPhase', 'idle');
    storeSet('petState', 'idle');
    sendState('idle', { justCompleted: 'break' });

    if (Notification.isSupported()) {
      const notification = new Notification({
        title: '番茄钟',
        body: '休息结束，准备开始下一个番茄！',
      });
      notification.show();
    }

    if (pomodoroConfig.autoStartNext) {
      setTimeout(() => {
        if (currentPhase !== 'idle') return;
        startPhase('focusing', pomodoroConfig.focusDuration);
      }, 2000);
    }
  }
}

function createWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  const savedX = storeGet('windowX');
  const savedY = storeGet('windowY');

  mainWindow = new BrowserWindow({
    width: 200,
    height: 260,
    x: savedX !== undefined ? savedX : screenWidth - 250,
    y: savedY !== undefined ? savedY : screenHeight - 300,
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

ipcMain.on('start-pomodoro-cycle', () => {
  startPhase('focusing', pomodoroConfig.focusDuration);
});

ipcMain.on('skip-break', () => {
  if (currentPhase !== 'short-break' && currentPhase !== 'long-break') return;
  if (phaseTimeout) {
    clearTimeout(phaseTimeout);
    phaseTimeout = null;
  }
  phaseEndTime = null;
  currentPhase = 'idle';
  storeSet('currentPhase', 'idle');
  storeSet('petState', 'idle');
  sendState('idle', { skipped: 'break' });

  if (pomodoroConfig.autoStartNext) {
    setTimeout(() => {
      if (currentPhase !== 'idle') return;
      startPhase('focusing', pomodoroConfig.focusDuration);
    }, 2000);
  }
});

ipcMain.on('abort-focus', () => {
  if (currentPhase !== 'focusing') return;
  if (phaseTimeout) {
    clearTimeout(phaseTimeout);
    phaseTimeout = null;
  }
  phaseEndTime = null;
  currentPhase = 'idle';
  storeSet('currentPhase', 'idle');
  storeSet('petState', 'idle');
  sendState('idle', { aborted: 'focus' });
});

ipcMain.on('stop-pomodoro', () => {
  if (phaseTimeout) {
    clearTimeout(phaseTimeout);
    phaseTimeout = null;
  }
  phaseEndTime = null;
  currentPhase = 'idle';
  storeSet('currentPhase', 'idle');
  storeSet('petState', 'idle');
  sendState('idle');
});

ipcMain.on('dismiss-alert', () => {
  if (currentPhase !== 'alert') return;
  currentPhase = 'idle';
  storeSet('currentPhase', 'idle');
  storeSet('petState', 'idle');
  sendState('idle');
});

ipcMain.on('set-pomodoro-config', (event, newConfig) => {
  pomodoroConfig = { ...pomodoroConfig, ...newConfig };
  storeSet('pomodoroConfig', pomodoroConfig);
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

ipcMain.handle('get-window-bounds', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const bounds = mainWindow.getBounds();
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    return { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height, screenWidth, screenHeight };
  }
  return null;
});

ipcMain.handle('get-store', (event, key) => {
  return storeGet(key);
});

ipcMain.on('set-store', (event, key, value) => {
  storeSet(key, value);
});

ipcMain.handle('get-pomodoro-state', () => {
  return {
    phase: currentPhase,
    completedPomodoros,
    config: pomodoroConfig,
    endTime: phaseEndTime,
  };
});

ipcMain.on('move-window', (event, deltaX, deltaY) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const [x, y] = mainWindow.getPosition();
    mainWindow.setPosition(x + deltaX, y + deltaY);
  }
});
