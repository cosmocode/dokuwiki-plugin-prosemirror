import KeyValueForm from './nodeviews/KeyValueForm';
import AbstractMenuItemDispatcher from './plugins/Menu/MenuItems/AbstractMenuItemDispatcher';
import MenuItem from './plugins/Menu/MenuItem';
import { setBlockTypeNoAttrCheck } from './customCommands';

export default function initializePublicAPI() {
    if (!window.Prosemirror.classes) {
        window.Prosemirror.classes = {};
    }
    window.Prosemirror.classes.KeyValueForm = KeyValueForm;
    window.Prosemirror.classes.MenuItem = MenuItem;
    window.Prosemirror.classes.AbstractMenuItemDispatcher = AbstractMenuItemDispatcher;

    if (!window.Prosemirror.commands) {
        window.Prosemirror.commands = {};
    }

    window.Prosemirror.commands.setBlockTypeNoAttrCheck = setBlockTypeNoAttrCheck;
}
