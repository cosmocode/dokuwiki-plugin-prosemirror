import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher.js';
import { svgIcon } from '../MDI.js';
import { setBlockTypeNoAttrCheck } from '../../../customCommands.js';
import MenuItem from '../MenuItem.js';

export default class CodeMenuItemDispatcher extends AbstractMenuItemDispatcher {
    static isAvailable(schema) {
        return !!schema.nodes.code_block;
    }

    static getMenuItem(schema) {
        if (!this.isAvailable(schema)) {
            throw new Error('Code blocks not available in this Schmea!');
        }
        return new MenuItem({
            command: setBlockTypeNoAttrCheck(schema.nodes.code_block),
            icon: svgIcon('code-braces'),
            label: LANG.plugins.prosemirror['label:code'],
        });
    }
}
