/**
 * Create a new MenuItem
 *
 * The constructor needs the following keys:
 *
 * command: must be command function created by prosemirror-commands or similar
 */
class MenuItem {
    isActive() { // eslint-disable-line class-methods-use-this
        return false;
    }

    constructor(options = {}) {
        if (typeof options.command !== 'function') {
            throw new Error('command is not a function!');
        }

        this.command = options.command;

        if (!(options.dom instanceof Element)) {
            throw new Error('dom must be a DOM node!');
        }

        this.dom = options.dom;

        if (typeof options.isActive === 'function') {
            this.isActive = options.isActive;
        }
    }
}

exports.MenuItem = MenuItem;
