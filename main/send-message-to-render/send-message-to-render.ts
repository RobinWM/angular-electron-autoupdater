import {win} from '../../main';

export function sendMessageToRender(channel:string,text:string) {
    win.webContents.on('did-finish-load', () => {
        win.webContents.send(channel, text);
    });
}
