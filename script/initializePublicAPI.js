import KeyValueForm from './nodeviews/KeyValueForm';
import AbstractMenuItemDispatcher from './plugins/Menu/MenuItems/AbstractMenuItemDispatcher';
import MenuItem from './plugins/Menu/MenuItem';
import { setBlockTypeNoAttrCheck } from './customCommands';

export default function initializePublicAPI() {
    window.Prosemirror = {};
    window.Prosemirror.pluginSchemas = [];
    window.Prosemirror.pluginMenuItemDispatchers = [];
    window.Prosemirror.pluginNodeViews = {};

    window.Prosemirror.classes = {};
    window.Prosemirror.classes.KeyValueForm = KeyValueForm;
    window.Prosemirror.classes.MenuItem = MenuItem;
    window.Prosemirror.classes.AbstractMenuItemDispatcher = AbstractMenuItemDispatcher;

    window.Prosemirror.commands = {};
    window.Prosemirror.commands.setBlockTypeNoAttrCheck = setBlockTypeNoAttrCheck;

    jQuery(document).trigger('PROSEMIRROR_API_INITIALIZED');
}
