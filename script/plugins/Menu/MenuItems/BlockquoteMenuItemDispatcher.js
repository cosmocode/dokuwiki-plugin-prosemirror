import { wrapIn } from 'prosemirror-commands';
import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher';
import { svgIcon } from '../MDI';
import MenuItem from '../MenuItem';

export default class BlockquoteMenuItemDispatcher extends AbstractMenuItemDispatcher {
    static isAvailable(schema) {
        return !!schema.nodes.blockquote;
    }

    static getMenuItem(schema) {
        if (!this.isAvailable(schema)) {
            console.log(schema);
            throw new Error('Blockquote is not available in schema!');
        }
        return new MenuItem({
            command: wrapIn(schema.nodes.blockquote),
            icon: svgIcon('format-quote-close'),
            label: 'Blockquote',
        });
    }
}
