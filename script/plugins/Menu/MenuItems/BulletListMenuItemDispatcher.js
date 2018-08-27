import { wrapInList } from 'prosemirror-schema-list';
import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher';
import MenuItem from '../MenuItem';
import { svgIcon } from '../MDI';

export default class BulletListMenuItemDispatcher extends AbstractMenuItemDispatcher {
    static isAvailable(schema) {
        return !!schema.nodes.bullet_list;
    }

    static getMenuItem(schema) {
        if (!this.isAvailable(schema)) {
            throw new Error('Bullet list not available in schema!');
        }
        return new MenuItem({
            icon: svgIcon('format-list-bulleted'),
            command: wrapInList(schema.nodes.bullet_list, {}),
            label: LANG.plugins.prosemirror['label:bulletList'],
        });
    }
}
