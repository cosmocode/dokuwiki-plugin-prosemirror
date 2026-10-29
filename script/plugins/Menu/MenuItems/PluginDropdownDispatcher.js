import AbstractDropdownDispatcher from './AbstractDropdownDispatcher.js';
import { svgIcon } from '../MDI.js';

class PluginDropdownDispatcher extends AbstractDropdownDispatcher {
    getMenuItem(schema) {
        return super.getMenuItem(schema, {
            icon: svgIcon('puzzle-outline'),
            label: 'Plugins',
        });
    }
}

export default PluginDropdownDispatcher;
