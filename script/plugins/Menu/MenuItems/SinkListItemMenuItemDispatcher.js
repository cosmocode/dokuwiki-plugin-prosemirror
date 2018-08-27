import { sinkListItem } from 'prosemirror-schema-list';
import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher';
import MenuItem from '../MenuItem';
import { svgIcon } from '../MDI';

export default class SinkListItemMenuItemDispatcher extends AbstractMenuItemDispatcher {
    static isAvailable(schema) {
        return !!schema.nodes.bullet_list || !!schema.nodes.ordered_list;
    }

    static getMenuItem(schema) {
        if (!this.isAvailable(schema)) {
            throw new Error('Lists are not available in the provided schema!');
        }
        return new MenuItem({
            icon: svgIcon('arrow-expand-right'),
            command: sinkListItem(schema.nodes.list_item),
            label: LANG.plugins.prosemirror['label:sinkListItem'],
        });
    }
}
