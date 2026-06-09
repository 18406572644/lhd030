const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('petAPI', {
  startPomodoroCycle: () => ipcRenderer.send('start-pomodoro-cycle'),
  skipBreak: () => ipcRenderer.send('skip-break'),
  abortFocus: () => ipcRenderer.send('abort-focus'),
  stopPomodoro: () => ipcRenderer.send('stop-pomodoro'),
  dismissAlert: () => ipcRenderer.send('dismiss-alert'),
  setPomodoroConfig: (config) => ipcRenderer.send('set-pomodoro-config', config),
  resetPosition: () => ipcRenderer.send('reset-position'),
  quit: () => ipcRenderer.send('quit'),
  onStateChanged: (callback) => {
    ipcRenderer.on('state-changed', (event, data) => callback(data));
  },
  getStore: (key) => ipcRenderer.invoke('get-store', key),
  getPomodoroState: () => ipcRenderer.invoke('get-pomodoro-state'),
  moveWindow: (deltaX, deltaY) => ipcRenderer.send('move-window', deltaX, deltaY),
});
