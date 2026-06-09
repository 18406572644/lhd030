const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('petAPI', {
  startFocus: (duration) => ipcRenderer.send('start-focus', duration),
  stopFocus: () => ipcRenderer.send('stop-focus'),
  resetPosition: () => ipcRenderer.send('reset-position'),
  quit: () => ipcRenderer.send('quit'),
  onStateChanged: (callback) => {
    ipcRenderer.on('state-changed', (event, ...args) => callback(...args));
  },
  getStore: (key) => ipcRenderer.invoke('get-store', key),
  moveWindow: (deltaX, deltaY) => ipcRenderer.send('move-window', deltaX, deltaY),
});
