import {ipcMain} from 'electron';
import {updateHandler} from '../update-handler/update-handler';

export function receiveMessageFromRender() {
    ipcMain.on('checkForUpdate', (event, data) => {
        updateHandler();
    });
}
