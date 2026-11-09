import { DOMParser } from '../vendor/prosemirror.js';
import KeyValueForm from './nodeviews/KeyValueForm.js';
import AbstractMenuItemDispatcher from './plugins/Menu/MenuItems/AbstractMenuItemDispatcher.js';
import MenuItem from './plugins/Menu/MenuItem.js';
import { setBlockTypeNoAttrCheck } from './customCommands.js';

export default function initializePublicAPI() {
    window.Prosemirror = {};
    window.Prosemirror.pluginSchemas = [];
    window.Prosemirror.pluginMenuItemDispatchers = [];
    window.Prosemirror.pluginNodeViews = {};

    window.Prosemirror.classes = {};
    window.Prosemirror.classes.KeyValueForm = KeyValueForm;
    window.Prosemirror.classes.MenuItem = MenuItem;
    window.Prosemirror.classes.AbstractMenuItemDispatcher = AbstractMenuItemDispatcher;
    window.Prosemirror.classes.DOMParser = DOMParser;

    window.Prosemirror.commands = {};
    window.Prosemirror.commands.setBlockTypeNoAttrCheck = setBlockTypeNoAttrCheck;

    jQuery(document).trigger('PROSEMIRROR_API_INITIALIZED');
}
