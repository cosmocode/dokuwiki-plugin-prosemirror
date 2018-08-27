import { setBlockType } from 'prosemirror-commands';
import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher';
import { svgIcon } from '../MDI';
import MenuItem from '../MenuItem';

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
