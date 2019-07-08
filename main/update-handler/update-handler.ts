import {sendMessageToRender} from '../send-message-to-render/send-message-to-render';
import {autoUpdater} from 'electron-updater';
import {dialog} from 'electron';
import {writeLog} from '../write-log/write-log';

export function updateHandler() {
    const returnData = {
        error: {status: -1, msg: '检测更新查询异常'},
        checking: {status: 1, msg: '正在检查应用程序更新'},
        updateAva: {status: 2, msg: '检测到新版本，正在下载,请稍后'},
        updateNotAva: {status: 0, msg: '您现在使用的版本为最新版本,无需更新!'},
    };

    autoUpdater.checkForUpdates();

    //  更新错误
    autoUpdater.on('error', message => {
        // log.error('' + returnData.error.msg);
        writeLog('error',returnData.error.msg)
        sendMessageToRender('message',returnData.error.msg);
    });

    //  检查更新中
    autoUpdater.on('checking-for-update', () => {
        // log.warn('' + returnData.checking.msg);
        writeLog('warn',returnData.checking.msg)
        sendMessageToRender('message',returnData.checking.msg);
    });

    //  发现新版本
    autoUpdater.on('update-available', (ev, info) => {
        // log.warn('' + returnData.updateAva.msg);
        writeLog('warn',returnData.updateAva.msg)

        sendMessageToRender('message',returnData.updateAva.msg);
    });

    //  当前为最新版本
    autoUpdater.on('update-not-available', info => {
        // log.warn('' + returnData.updateNotAva.msg);
        writeLog('error',returnData.updateNotAva.msg)

        sendMessageToRender('message',returnData.updateNotAva.msg);
    });

    // 更新包下载进度时间
    autoUpdater.on('download-progress', (progressObj) => {
        // log.warn(JSON.stringify(progressObj));
        writeLog('warn',progressObj)
        sendMessageToRender('downloadProgress',progressObj.percent.toString());
    });

    // 更新包下载完成后触发事件
    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName, releaseDate) => {
        // log.info('A new version has been downloaded');
        writeLog('info','A new version has been downloaded');
        const dialogOpts = {
            buttons: ['關閉', '稍後'],
            title: '版本更新提示',
            message: process.platform === 'win32' ? releaseNotes : releaseName,
            detail: '新版本已下載完成，請關閉程式以安裝新版本！'
        };
        dialog.showMessageBox(dialogOpts, response => {
            if (response === 0) {
                autoUpdater.quitAndInstall();
            }
        });
    });
}
