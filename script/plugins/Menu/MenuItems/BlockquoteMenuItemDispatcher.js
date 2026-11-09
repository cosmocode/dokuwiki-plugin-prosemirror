import { wrapIn } from '../../../../vendor/prosemirror.js';
import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher.js';
import { svgIcon } from '../MDI.js';
import MenuItem from '../MenuItem.js';

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
            label: LANG.plugins.prosemirror['label:blockquote'],
        });
    }
}
