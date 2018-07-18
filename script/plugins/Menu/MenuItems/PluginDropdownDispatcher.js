import AbstractDropdownDispatcher from './AbstractDropdownDispatcher';

class PluginDropdownDispatcher extends AbstractDropdownDispatcher {
    getMenuItem(schema) {
        return super.getMenuItem(schema, { label: 'Plugins' });
    }
}

export default PluginDropdownDispatcher;
