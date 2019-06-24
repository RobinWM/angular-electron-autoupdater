"use strict";
exports.__esModule = true;
var electron_updater_1 = require("electron-updater");
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var os = require("os");
var log = require("electron-log");
var win;
var args = process.argv.slice(1);
var serve = args.some(function (val) {
    return val === '--serve';
});
var packageJson = require('./package');
try {
    electron_1.app.on('ready', createWindow);
    electron_1.app.on('window-all-closed', function () {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
    electron_1.app.on('activate', function () {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });
    electron_1.app.on('will-quit', function () {
        electron_1.globalShortcut.unregisterAll();
    });
}
catch (e) {
    log.debug(e);
}
function createWindow() {
    var size = electron_1.screen.getPrimaryDisplay().workAreaSize;
    win = new electron_1.BrowserWindow({
        x: 0,
        y: 0,
        width: size.width,
        height: size.height,
        webPreferences: { webSecurity: false }
    });
    if (serve) {
        require('electron-reload')(__dirname, {
            electron: require(__dirname + '/node_modules/electron')
        });
        win.loadURL('http://localhost:4200');
    }
    else {
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'dist/angular-electron-autoUpdater/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
    /*打开调试模式*/
    // win.webContents.openDevTools();
    win.setMenuBarVisibility(false);
    win.on('closed', function () {
        win = null;
    });
    electron_1.app.requestSingleInstanceLock(); // 保证只运行一个electron窗口
    writeLog();
    updateHandle();
    shortcutRegister();
}
/*自动更新处理*/
function updateHandle() {
    var returnData = {
        error: { status: -1, msg: '检测更新查询异常' },
        checking: { status: 1, msg: '正在检查应用程序更新' },
        updateAva: { status: 2, msg: '检测到新版本，正在下载,请稍后' },
        updateNotAva: { status: 0, msg: '您现在使用的版本为最新版本,无需更新!' }
    };
    electron_updater_1.autoUpdater.checkForUpdates();
    electron_updater_1.autoUpdater.on('error', function (message) {
        log.error('' + returnData.error.msg);
    });
    electron_updater_1.autoUpdater.on('checking-for-update', function () {
        log.warn('' + returnData.checking.msg);
    });
    electron_updater_1.autoUpdater.on('update-available', function (ev, info) {
        log.warn('' + returnData.updateAva.msg);
    });
    electron_updater_1.autoUpdater.on('update-not-available', function (info) {
        log.warn('' + returnData.updateNotAva.msg);
    });
    electron_updater_1.autoUpdater.on('download-progress', function (progressObj) {
        log.info('' + JSON.stringify(progressObj));
    });
    electron_updater_1.autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName) {
        log.info('A new version has been downloaded. ');
        var dialogOpts = {
            buttons: ['关闭', '稍后'],
            title: '版本更新提示',
            message: process.platform === 'win32' ? releaseNotes : releaseName,
            detail: '新版本已经下载完成，请重新关闭应用程序以安装新版本'
        };
        electron_1.dialog.showMessageBox(dialogOpts, function (response) {
            if (response === 0) {
                electron_updater_1.autoUpdater.quitAndInstall();
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
    var date = new Date();
    var month = (date.getMonth() + 1).toString();
    var strDate = (date.getDate()).toString();
    if (Number(month) >= 1 && Number(month) <= 9) {
        month = '0' + month;
    }
    if (Number(strDate) >= 0 && Number(strDate) <= 9) {
        strDate = '0' + strDate;
    }
    var currentdate = date.getFullYear() + '-' + month + '-' + strDate;
    /*log 文件名和存放的位置*/
    var ul = os.homedir() + '\\AppData\\Roaming\\angular-electron-autoUpdater\\logs\\';
    log.transports.file.file = ul + currentdate + '.txt';
    log.transports.file.level = false;
    log.transports.console.level = false;
    log.transports.file.level = 'silly';
    log.transports.console.level = 'silly';
}
/*注册快捷键*/
function shortcutRegister() {
    /*打开调试模式*/
    electron_1.globalShortcut.register('Command+Control+Alt+Shift+D', function () {
        win.webContents.openDevTools();
    });
    /*手动检查更新*/
    electron_1.globalShortcut.register('Command+Control+Alt+Shift+U', function () {
        updateHandle();
    });
}
