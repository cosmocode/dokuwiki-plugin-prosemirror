import AbstractDropdownDispatcher from './AbstractDropdownDispatcher';

export default class MarkDropdownDispatcher extends AbstractDropdownDispatcher {
    getMenuItem(schema) {
        return super.getMenuItem(schema, { label: LANG.plugins.prosemirror['label:marks'] });
    }
}
