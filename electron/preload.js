
const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 菜单事件监听
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-new-character', callback);
    ipcRenderer.on('menu-import', callback);
    ipcRenderer.on('menu-export', callback);
  },
  
  // 移除监听器
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});
