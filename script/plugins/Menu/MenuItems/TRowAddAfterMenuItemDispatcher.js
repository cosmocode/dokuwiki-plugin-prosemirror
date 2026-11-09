import { addRowAfter } from '../../../../vendor/prosemirror.js';
import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher.js';
import { svgIcon } from '../MDI.js';
import MenuItem from '../MenuItem.js';

export default class TRowAddAfterMenuItemDispatcher extends AbstractMenuItemDispatcher {
    static isAvailable(schema) {
        return !!schema.nodes.table;
    }

    static getMenuItem(schema) {
        if (!this.isAvailable(schema)) {
            throw new Error('Table not available in schema!');
        }

        return new MenuItem({
            command: addRowAfter,
            icon: svgIcon('table-row-plus-after'),
            label: LANG.plugins.prosemirror['label:table-add-row-after'],
        });
    }
}
