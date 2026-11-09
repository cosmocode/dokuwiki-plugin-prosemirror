import { wrapInList } from '../../../../vendor/prosemirror.js';
import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher.js';
import MenuItem from '../MenuItem.js';
import { svgIcon } from '../MDI.js';

export default class OderedListMenuItemDispatcher extends AbstractMenuItemDispatcher {
    static isAvailable(schema) {
        return !!schema.nodes.ordered_list;
    }

    static getMenuItem(schema) {
        if (!this.isAvailable(schema)) {
            throw new Error('Ordered list not available in schema!');
        }
        return new MenuItem({
            icon: svgIcon('format-list-numbers'),
            command: wrapInList(schema.nodes.ordered_list, {}),
            label: LANG.plugins.prosemirror['label:orderedList'],
        });
    }
}
