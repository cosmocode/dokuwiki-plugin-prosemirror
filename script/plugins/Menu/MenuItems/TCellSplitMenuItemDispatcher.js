import { splitCell } from 'prosemirror-tables';
import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher';
import { svgIcon } from '../MDI';
import MenuItem from '../MenuItem';

export default class TCellSplitMenuItemDispatcher extends AbstractMenuItemDispatcher {
    static isAvailable(schema) {
        return !!schema.nodes.table;
    }

    static getMenuItem(schema) {
        if (!this.isAvailable(schema)) {
            throw new Error('Table not available in schema!');
        }

        return new MenuItem({
            command: splitCell,
            icon: svgIcon('arrow-split-vertical'),
            label: LANG.plugins.prosemirror['label:table-cell-split'],
        });
    }
}
