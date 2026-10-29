import { deleteColumn } from 'prosemirror-tables';
import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher.js';
import { svgIcon } from '../MDI.js';
import MenuItem from '../MenuItem.js';

export default class TColumnDeleteMenuItemDispatcher extends AbstractMenuItemDispatcher {
    static isAvailable(schema) {
        return !!schema.nodes.table;
    }

    static getMenuItem(schema) {
        if (!this.isAvailable(schema)) {
            throw new Error('Table not available in schema!');
        }

        return new MenuItem({
            command: deleteColumn,
            icon: svgIcon('table-column-remove'),
            label: LANG.plugins.prosemirror['label:table-column-delete'],
        });
    }
}
