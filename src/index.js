const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('fs').promises; // Use promises version of fs

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // Enable context isolation for security
      enableRemoteModule: false, // Disable remote module for security
    },
  });

  // Load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Hide the menu bar
  mainWindow.menuBarVisible = false;
};

// IPC handler for reading the vaults from obsidian.json
ipcMain.handle('get-vaults', async () => {
  let configPath = '';

  // Determine the path based on the operating system
  switch (process.platform) {
    case 'win32':
      configPath = path.join(process.env.APPDATA, 'obsidian', 'obsidian.json');
      break;
    case 'darwin':
      configPath = path.join(process.env.HOME, 'Library', 'Application Support', 'obsidian', 'obsidian.json');
      break;
    case 'linux':
      configPath = path.join(process.env.HOME, '.config', 'obsidian', 'obsidian.json');
      break;
    default:
      console.error('Unknown platform');
      return []; // Return an empty array if the platform is unknown
  }

  try {
    // Read the file asynchronously
    const data = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(data);
    return config.vaults || []; // Return vaults or an empty array if undefined
  } catch (error) {
    console.error('Error reading or parsing the config file:', error);
    return []; // Return an empty array in case of an error
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  createWindow();

  // On macOS, it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});