import { redo } from '../../../../vendor/prosemirror.js';
import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher.js';
import { svgIcon } from '../MDI.js';
import MenuItem from '../MenuItem.js';

export default class RedoMenuItemDispatcher extends AbstractMenuItemDispatcher {
    // history should be available regardless of current schema
    static isAvailable() {
        return true;
    }

    static getMenuItem() {
        return new MenuItem({
            command: redo,
            icon: svgIcon('redo'),
            label: LANG.plugins.prosemirror['label:redo'],
        });
    }
}
