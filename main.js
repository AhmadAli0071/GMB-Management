const { app, BrowserWindow, Notification } = require('electron');
const path = require('path');

let mainWindow;

const PRODUCTION_URL = 'https://skyblue-heron-259301.hostingersite.com';
const APP_URL = process.env.APP_URL || PRODUCTION_URL;

app.setAppUserModelId('CD-GBP-Portal');

function createWindow() {
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

  mainWindow.webContents.on('console-message', (_event, level, message) => {
    if (!message.startsWith('__NOTIF__')) return;
    try {
      const data = JSON.parse(message.substring(9));
      if (Notification.isSupported()) {
        const notif = new Notification({ title: data.title || 'CD-GBP-Portal', body: data.body || '', silent: false });
        notif.on('click', () => {
          if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
          }
        });
        notif.show();
      }
    } catch (e) {}
  });

  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.executeJavaScript(`
      (function() {
        window.Notification = function(title, options) {
          var body = (options && options.body) || '';
          console.log('__NOTIF__' + JSON.stringify({title: title, body: body}));
        };
        Object.defineProperty(window.Notification, 'permission', { get: function() { return 'granted'; }, configurable: true });
        window.Notification.requestPermission = function() { return Promise.resolve('granted'); };
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
