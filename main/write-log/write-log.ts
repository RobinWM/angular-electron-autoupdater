import * as os from 'os';
import * as log from 'electron-log';

export function writeLog(level: string, message: any) {
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

    if (level == 'error') {
        log.error(message);
    } else if (level == 'warn') {
        log.warn(message);
    } else if (level == 'debug') {
        log.debug(message);
    } else {
        log.info(message);
    }
}
