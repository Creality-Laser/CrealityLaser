/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import path from 'path';
import DataStorage from './DataStorage';
import launchServer from './server-cli';
import i18n from './utils/i18n';
import MenuBuilder from './electron-app/menu';
import pkg from './package.json';
import store from './store';
// import genGcoreTest from './server/lib/dllNapi/test/gen_gcore';

const getAssetPath = (...paths: string[]): string => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  return path.join(RESOURCES_PATH, ...paths);
};

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
// let server: Application | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const windowBounds = store.get('winBounds', {}) || {};
  const defaultWindowOptions = {
    show: false,
    width: 1024,
    height: 728,
    title: `${pkg.name} ${pkg.version}`,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  };

  const windowOptions = {
    ...defaultWindowOptions,
    ...(windowBounds as any),
  };

  mainWindow = new BrowserWindow(windowOptions);

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('resized', () => {
    if (mainWindow) {
      store.set('winBounds', mainWindow.getBounds());
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // i18n.on('loaded', (loaded) => {
  //     i18n.changeLanguage('en');
  //     i18n.off('loaded');
  //   });

  i18n.on('languageChanged', (lng) => {
    menuBuilder.buildMenu();
    if (mainWindow) {
      mainWindow.webContents.send('language-changed', {
        language: lng,
      });
    }

    // menuFactoryService.buildMenu(app, win, i18n);
  });

  // handle webContents language change, then change electron menu language meanwhile.
  ipcMain.on('language-changed', (_, language) => {
    if (language === i18n.language) {
      return;
    }
    i18n.changeLanguage(language);
    menuBuilder.buildMenu();
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// app.whenReady().then(createWindow).catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

app.on('ready', async () => {
  try {
    // await genGcoreTest();

    DataStorage.init();

    const data = await launchServer();

    const { address = '', port = '', routes = '' } = { ...data };

    console.log(
      address,
      port,
      routes,
      '========= address, port, routes =============='
    );

    store.set('backendInfo', { address, port });

    await createWindow();
  } catch (err) {
    console.error('Error app onReady: ', err);
  }
});
