
const { contextBridge, ipcRenderer } = require('electron');

// Exposed safe API Give rendering process
contextBridge.exposeInMainWorld('electronAPI', {
  // Menu event listening
    onMenuAction: (callback) => {
    ipcRenderer.on('menu-new-character', callback);
    ipcRenderer.on('menu-import', callback);
    ipcRenderer.on('menu-export', callback);
  },
  
  // Remove the listener
    removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});
