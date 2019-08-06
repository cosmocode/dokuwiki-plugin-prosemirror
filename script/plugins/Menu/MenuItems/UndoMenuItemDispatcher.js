import { undo } from 'prosemirror-history';
import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher';
import { svgIcon } from '../MDI';
import MenuItem from '../MenuItem';

export default class UndoMenuItemDispatcher extends AbstractMenuItemDispatcher {
    // history should be available regardless of current schema
    static isAvailable() {
        return true;
    }

    static getMenuItem() {
        return new MenuItem({
            command: undo,
            icon: svgIcon('undo'),
            label: LANG.plugins.prosemirror['label:undo'],
        });
    }
}
