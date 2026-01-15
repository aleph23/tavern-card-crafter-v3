
const { app, BrowserWindow, Menu, ipcMain, safeStorage } = require('electron'); // Added safeStorage
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

const promptsPath = path.join(process.cwd(), 'prompts.json');

// IPC Handlers for prompts
ipcMain.handle('load-prompts', async () => {
  try {
    if (fs.existsSync(promptsPath)) {
      const data = fs.readFileSync(promptsPath, 'utf-8');
      return JSON.parse(data);
    }
    return null; // Return null to indicate use defaults
  } catch (error) {
    console.error('Failed to load prompts:', error);
    throw error;
  }
});
// Save prompts with enhanced error handling for permission issues
ipcMain.handle('save-prompts', async (event, prompts) => {
  try {
    fs.writeFileSync(promptsPath, JSON.stringify(prompts, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Failed to save prompts:', error);

    // Check for specific permission errors
    if (error.code === 'EACCES' || error.code === 'EPERM' || error.code === 'EROFS') {
      // Throw a friendly error string that the frontend can display directly
      throw new Error(
        'PERMISSION DENIED: The application is in a read-only folder. Please move the app to a writable location (like your Desktop) to save changes.'
      );
    }

    // Re-throw generic errors for other issues (disk full, etc.)
    throw error;
  }
});

ipcMain.handle('reset-prompts', async () => {
  try {
    if (fs.existsSync(promptsPath)) {
      fs.unlinkSync(promptsPath);
    }
    return true;
  } catch (error) {
    console.error('Failed to reset prompts:', error);
    throw error;
  }
});

function createWindow() {
/**
 * Creates and configures the main application browser window.
 * Sets up window display behavior, loading of the app content, and key window event handlers.
 *
 * This function initializes the main BrowserWindow instance with predefined dimensions,
 * security options, and UI settings, then loads either the development server or the
 * production build depending on the environment.
 * It also manages when the window is shown, handles cleanup on close, and prevents
 * new in-app windows from opening by redirecting external links to the default browser.
 *
 * Args:
 *   None
 *
 * Returns:
 *   void
 */
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    },
    icon: path.join(__dirname, '../public/favicon.ico'),
    title: 'Tavern Card Crafter - AI character card creation tool',
    show: false, // Don't display it first, wait until the load is completed before displaying
    titleBarStyle: 'default',
    frame: true
  });

  // Loading the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:6090');
    // Open the developer tools in development mode
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Displayed after the window is ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Focus window
    if (isDev) {
      mainWindow.focus();
    }
  });

  // When the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Prevent new window from opening
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

// 当 Electron Call this method when you complete initialization and prepare to create a browser window
app.whenReady().then(() => {
  createWindow();

  // macOS Under, when all windows are closed, the application will usually remain active
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Exit the app when all windows are closed (Apart from macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In development mode, when the main process receives a hot reload signal
if (isDev) {
  try {
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
      hardResetMethod: 'exit'
    });
  } catch (e) {
    console.log('electron-reload not available in production');
  }
}

// Settings Application Menu
const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New Character',
        accelerator: 'CmdOrCtrl+N',
        click: () => {
          mainWindow.webContents.send('menu-new-character');
        }
      },
      {
        label: 'Import',
        accelerator: 'CmdOrCtrl+O',
        click: () => {
          mainWindow.webContents.send('menu-import');
        }
      },
      {
        label: 'Export',
        accelerator: 'CmdOrCtrl+S',
        click: () => {
          mainWindow.webContents.send('menu-export');
        }
      },
      { type: 'separator' },
      {
        label: 'Exit',
        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
        click: () => {
          app.quit();
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
      { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
      { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
      { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
      { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
      { label: 'Toggle Developer Tools', accelerator: 'F12', role: 'toggleDevTools' },
      { type: 'separator' },
      { label: 'Actual Size', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
      { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
      { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
      { type: 'separator' },
      { label: 'Toggle Fullscreen', accelerator: 'F11', role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'About',
        click: () => {
          require('electron').dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'About Tavern Card Crafter',
            message: 'Tavern Card Crafter',
            detail: 'AI character card creation tool\n Professional AI character card making tool to help users easily create and edit character cards for chatbots and role-playing'
          });
        }
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
