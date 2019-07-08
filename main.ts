import {updateHandler} from './main/update-handler/update-handler';
import {shortcutRegister} from './main/shortcut-register/shortcut-register';
import {writeLog} from './main/write-log/write-log';
import {receiveMessageFromRender} from './main/receive-message-from-render/receive-message-from-render';
import {app, BrowserWindow, screen, globalShortcut} from 'electron';
import * as path from 'path';
import * as url from 'url';

export let win;
const args = process.argv.slice(1);
const serve = args.some(function(val) {
    return val === '--serve';
});
const packageJson = require('./package');

try {
    app.on('ready', createWindow);
    app.on('window-all-closed', () => {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });
    app.on('activate', () => {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });
    app.on('will-quit', () => {
        globalShortcut.unregisterAll();
    });
} catch (e) {
    writeLog('debug', e);
}

function createWindow() {
    const size = screen.getPrimaryDisplay().workAreaSize;

    win = new BrowserWindow({
        x: 0,
        y: 0,
        width: size.width,
        height: size.height,
        webPreferences: {webSecurity: false}
    });
    if (serve) {
        require('electron-reload')(__dirname, {
            electron: require(__dirname + '/node_modules/electron')
        });
        win.loadURL('http://localhost:4200');
    } else {
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'dist/angular-electron-autoUpdater/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }

    /*打开调试模式*/
    // win.webContents.openDevTools();

    /*顶部菜单栏是否显示*/
    win.setMenuBarVisibility(false);

    win.on('closed', function() {
        win = null;
    });
    app.requestSingleInstanceLock();  // 保证只运行一个electron应用窗口
    updateHandler();
    receiveMessageFromRender();
    shortcutRegister();
}



