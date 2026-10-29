import { setBlockType } from 'prosemirror-commands';
import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher.js';
import MenuItem from '../MenuItem.js';
import { svgIcon } from '../MDI.js';

export default class ParagraphMenuItemDispatcher extends AbstractMenuItemDispatcher {
    static isAvailable(schema) {
        return !!schema.nodes.paragraph;
    }

    static getMenuItem(schema) {
        if (!this.isAvailable(schema)) {
            throw new Error('Paragraph not availabe in Schema!');
        }
        return new MenuItem({
            command: setBlockType(schema.nodes.paragraph),
            icon: svgIcon('format-paragraph'),
            label: LANG.plugins.prosemirror['label:paragraph'],
        });
    }
}
