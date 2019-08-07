import { redo } from 'prosemirror-history';
import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher';
import { svgIcon } from '../MDI';
import MenuItem from '../MenuItem';

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
