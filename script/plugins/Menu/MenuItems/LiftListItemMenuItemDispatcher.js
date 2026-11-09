import { liftListItem } from '../../../../vendor/prosemirror.js';
import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher.js';
import MenuItem from '../MenuItem.js';
import { svgIcon } from '../MDI.js';

export default class LiftListItemMenuItemDispatcher extends AbstractMenuItemDispatcher {
    static isAvailable(schema) {
        return !!schema.nodes.bullet_list || !!schema.nodes.ordered_list;
    }

    static getMenuItem(schema) {
        if (!this.isAvailable(schema)) {
            throw new Error('Lists are not available in the provided schema!');
        }
        return new MenuItem({
            icon: svgIcon('arrow-expand-left'),
            command: liftListItem(schema.nodes.list_item),
            label: LANG.plugins.prosemirror['label:liftLI'],
        });
    }
}
