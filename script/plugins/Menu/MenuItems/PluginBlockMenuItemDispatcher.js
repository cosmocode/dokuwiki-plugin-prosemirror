import { setBlockType } from '../../../../vendor/prosemirror.js';
import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher.js';
import { svgIcon } from '../MDI.js';
import MenuItem from '../MenuItem.js';

export default class PluginBlockMenuItemDispatcher extends AbstractMenuItemDispatcher {
    static isAvailable({ nodes }) {
        return !!nodes.dwplugin_block;
    }

    static getMenuItem({ nodes }) {
        if (!this.isAvailable({ nodes })) {
            throw new Error('Plugin block not available in schema!');
        }
        return new MenuItem({
            command: setBlockType(nodes.dwplugin_block),
            icon: svgIcon('puzzle'),
            label: LANG.plugins.prosemirror['label:pluginBlock'],
        });
    }
}
