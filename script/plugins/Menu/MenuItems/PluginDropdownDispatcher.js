import AbstractDropdownDispatcher from './AbstractDropdownDispatcher';
import { svgIcon } from '../MDI';

class PluginDropdownDispatcher extends AbstractDropdownDispatcher {
    getMenuItem(schema) {
        return super.getMenuItem(schema, {
            icon: svgIcon('puzzle-outline'),
            label: 'Plugins',
        });
    }
}

export default PluginDropdownDispatcher;
