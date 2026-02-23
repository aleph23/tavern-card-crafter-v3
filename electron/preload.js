const { contextBridge, ipcRenderer } = require('electron')

// Debug logging (uncomment for troubleshooting)
// console.log('[PRELOAD] Preload script is loading...');

// Exposed safe API Give rendering process
contextBridge.exposeInMainWorld('electronAPI', {
  // Menu event listening
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-new-character', callback)
    ipcRenderer.on('menu-import', callback)
    ipcRenderer.on('menu-export', callback)
  },

  // Remove the listener
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel)
  },

  // Prompt management
  loadPrompts: () => {
    // console.log('[PRELOAD] loadPrompts called');
    return ipcRenderer.invoke('load-prompts')
  },
  savePrompts: (prompts) => {
    // console.log('[PRELOAD] savePrompts called, invoking IPC...');
    // console.log('[PRELOAD] Prompts data size:', JSON.stringify(prompts).length, 'chars');
    return ipcRenderer.invoke('save-prompts', prompts)
    // .then((result) => { console.log('[PRELOAD] savePrompts IPC returned:', result); return result; })
    // .catch((err) => { console.error('[PRELOAD] savePrompts IPC error:', err); throw err; });
  },
  resetPrompts: () => {
    // console.log('[PRELOAD] resetPrompts called');
    return ipcRenderer.invoke('reset-prompts')
  },

  // Config management
  loadConfig: () => {
    console.log('[PRELOAD] loadConfig called')
    return ipcRenderer.invoke('load-config')
  },
  saveConfig: (config) => {
    console.log('[PRELOAD] saveConfig called, invoking IPC...')
    console.log('[PRELOAD] Config data size:', JSON.stringify(config).length, 'chars')
    return ipcRenderer.invoke('save-config', config)
    //  .then((result) => { console.log('[PRELOAD] saveConfig IPC returned:', result); return result; })
    //  .catch((err) => { console.error('[PRELOAD] saveConfig IPC error:', err); throw err; });
  },
  resetConfig: () => {
    console.log('[PRELOAD] resetConfig called')
    return ipcRenderer.invoke('reset-config')
  },
})
