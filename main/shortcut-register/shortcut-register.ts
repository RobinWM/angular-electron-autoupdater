import {globalShortcut} from 'electron';
import {updateHandler} from '../update-handler/update-handler';
import {win} from '../../main';

export function shortcutRegister() {
    /*打开调试模式*/
    globalShortcut.register('Command+Control+Alt+Shift+D', () => {
        win.webContents.openDevTools();
    });

    /*手动检查更新*/
    globalShortcut.register('Command+Control+Alt+Shift+U', () => {
        updateHandler();
    });
}
