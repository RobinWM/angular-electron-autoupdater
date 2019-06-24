import {autoUpdater} from 'electron-updater';
import {app, BrowserWindow, screen, ipcMain, dialog, globalShortcut} from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';
import * as os from 'os';
import * as log from 'electron-log';

let win;
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
    log.debug(e);
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
    win.setMenuBarVisibility(false);

    win.on('closed', function() {
        win = null;
    });
    app.requestSingleInstanceLock();  // 保证只运行一个electron窗口
    writeLog();
    updateHandle();
    shortcutRegister();
}

/*自动更新处理*/
function updateHandle() {
    const returnData = {
        error: {status: -1, msg: '检测更新查询异常'},
        checking: {status: 1, msg: '正在检查应用程序更新'},
        updateAva: {status: 2, msg: '检测到新版本，正在下载,请稍后'},
        updateNotAva: {status: 0, msg: '您现在使用的版本为最新版本,无需更新!'},
    };

    autoUpdater.checkForUpdates();

    autoUpdater.on('error', message=> {
        log.error('' + returnData.error.msg);
    });

    autoUpdater.on('checking-for-update', ()=>{
        log.warn('' + returnData.checking.msg);
    });

    autoUpdater.on('update-available', (ev, info)=> {
        log.warn('' + returnData.updateAva.msg);
    });

    autoUpdater.on('update-not-available', info=> {
        log.warn('' + returnData.updateNotAva.msg);
    });

    autoUpdater.on('download-progress', (progressObj)=> {
        log.info('' + JSON.stringify(progressObj));
    });

    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName, releaseDate)=> {
        log.info('A new version has been downloaded. ');
        const dialogOpts = {
            buttons: ['关闭', '稍后'],
            title: '版本更新提示',
            message: process.platform === 'win32' ? releaseNotes : releaseName,
            detail: '新版本已经下载完成，请重新关闭应用程序以安装新版本'
        };
        dialog.showMessageBox(dialogOpts, response=> {
            if (response === 0) {
                autoUpdater.quitAndInstall();
            }
        });
    });
}

// 通过main进程发送事件给renderer进程，提示更新信息
function sendUpdateMessage(text) {
    win.webContents.send('message', text);
}

/*接收来自渲染进程(angular)的值*/
function writeLog() {
    const date = new Date();
    let month = (date.getMonth() + 1).toString();
    let strDate = (date.getDate()).toString();
    if (Number(month) >= 1 && Number(month) <= 9) {
        month = '0' + month;
    }
    if (Number(strDate) >= 0 && Number(strDate) <= 9) {
        strDate = '0' + strDate;
    }
    const currentdate = date.getFullYear() + '-' + month + '-' + strDate;
    /*log 文件名和存放的位置*/
    const ul = os.homedir() + '\\AppData\\Roaming\\angular-electron-autoUpdater\\logs\\';
    log.transports.file.file = ul + currentdate + '.txt';
    log.transports.file.level = false;
    log.transports.console.level = false;
    log.transports.file.level = 'silly';
    log.transports.console.level = 'silly';
}

/*注册快捷键*/
function shortcutRegister() {
    /*打开调试模式*/
    globalShortcut.register('Command+Control+Alt+Shift+D', () => {
        win.webContents.openDevTools();
    });

    /*手动检查更新*/
    globalShortcut.register('Command+Control+Alt+Shift+U', () => {
        updateHandle();
    });
}
