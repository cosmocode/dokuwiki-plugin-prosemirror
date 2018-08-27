import { setBlockType } from 'prosemirror-commands';
import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher';
import MenuItem from '../MenuItem';
import { svgIcon } from '../MDI';

export default class HeadingMenuItemDispatcher extends AbstractMenuItemDispatcher {
    /**
     * Create an MenuItemDispatcher to set the blocktype to a heading at the given level
     *
     * @param {int} level the level of the heading, from 1 to 6
     */
    constructor(level) {
        super();
        this.level = level;
    }

    isAvailable(schema) { // eslint-disable-line class-methods-use-this
        return !!schema.nodes.heading;
    }

    getMenuItem(schema) {
        if (!this.isAvailable(schema)) {
            throw new Error('Headings not available in this schema!');
        }
        return new MenuItem({
            command: setBlockType(schema.nodes.heading, { level: this.level }),
            icon: svgIcon(`format-header-${this.level}`),
            label: LANG.plugins.prosemirror['label:heading'].replace(/%s/, this.level),
        });
    }
}
