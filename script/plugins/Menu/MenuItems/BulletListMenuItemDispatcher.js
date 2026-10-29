import { wrapInList } from 'prosemirror-schema-list';
import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher.js';
import MenuItem from '../MenuItem.js';
import { svgIcon } from '../MDI.js';

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
