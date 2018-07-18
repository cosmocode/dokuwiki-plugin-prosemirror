import { wrapInList } from 'prosemirror-schema-list';
import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher';
import MenuItem from '../MenuItem';
import { svgIcon } from '../MDI';

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
            label: 'Wrap in ordered list',
        });
    }
}
