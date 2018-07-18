import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher';
import { svgIcon } from '../MDI';
import { setBlockTypeNoAttrCheck } from '../../../customCommands';
import MenuItem from '../MenuItem';

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
            label: 'Code Block',
        });
    }
}
