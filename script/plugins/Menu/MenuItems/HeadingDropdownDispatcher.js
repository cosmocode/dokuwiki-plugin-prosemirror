import AbstractDropdownDispatcher from './AbstractDropdownDispatcher';

export default class HeadingDropdownDispatcher extends AbstractDropdownDispatcher {
    getMenuItem(schema) {
        return super.getMenuItem(schema, { label: 'Headings' });
    }
}
