let electron;
try {
  electron = require('electron');
} catch (e) {
  require('./server/index.js');
  return;
}

const { app, BrowserWindow, ipcMain, Notification } = electron;
const path = require('path');
const https = require('https');

let mainWindow;

const PRODUCTION_URL = 'https://skyblue-heron-259301.hostingersite.com';
const APP_URL = process.env.APP_URL || PRODUCTION_URL;

app.setAppUserModelId('CD-GBP-Portal');

ipcMain.on('show-notification', (_event, { title, body }) => {
  if (Notification.isSupported()) {
    const notif = new Notification({ title, body, silent: false });
    notif.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
    });
    notif.show();
  }
});

function waitForServer(url, retries = 15) {
  return new Promise((resolve) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      https
        .get(`${url}/api/health`, (res) => {
          resolve(res.statusCode === 200);
        })
        .on('error', () => {
          if (attempts < retries) {
            setTimeout(check, 2000);
          } else {
            resolve(false);
          }
        });
    };
    check();
  });
}

function showErrorWindow(errorMessage) {
  const errorWindow = new BrowserWindow({
    width: 600,
    height: 400,
    title: 'CD-GBP-Portal - Error',
    autoHideMenuBar: true,
    resizable: false,
  });

  errorWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(`
      <html>
        <body style="font-family:sans-serif;padding:40px;background:#1a1a2e;color:#e94560;text-align:center;">
          <h1>Connection Failed</h1>
          <p style="color:#eee;word-break:break-word;">${errorMessage}</p>
          <p style="color:#aaa;font-size:12px;">Check your internet connection and try again.</p>
        </body>
      </html>
    `)}`
  );
}

async function createWindow() {
  const serverReady = await waitForServer(APP_URL);

  if (!serverReady) {
    showErrorWindow('Could not connect to the server. Please check your internet connection.');
    return;
  }

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'CD-GBP-Portal',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    show: false,
  });

  mainWindow.webContents.session.setPermissionRequestHandler((_webContents, permission, callback) => {
    callback(true);
  });

  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.executeJavaScript(`
      (function() {
        const OrigNotification = window.Notification;
        window.Notification = function(title, options) {
          try { new OrigNotification(title, options); } catch(e) {}
        };
        window.Notification.permission = 'granted';
        window.Notification.requestPermission = function() { return Promise.resolve('granted'); };
        Object.defineProperty(window.Notification, 'permission', {
          get: function() { return 'granted'; },
          configurable: true
        });
      })();
    `);
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.loadURL(APP_URL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
