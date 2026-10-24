// 森林还债管家 · Electron 主进程（CommonJS，package.json 为 ESM，故用 .cjs 后缀）
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('node:path');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1024,
    minHeight: 680,
    title: '森林还债管家',
    backgroundColor: '#F0F4E9',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  // 去掉顶部默认菜单栏，界面更干净
  Menu.setApplicationMenu(null);

  const indexPath = path.join(__dirname, '..', 'standalone', 'app', 'index.html');
  mainWindow.loadFile(indexPath);

  // 外部链接一律交给系统浏览器，不在应用内新开窗口
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 单实例锁：重复启动时聚焦已有窗口，不开第二个
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
