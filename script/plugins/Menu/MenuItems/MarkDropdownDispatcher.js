import AbstractDropdownDispatcher from './AbstractDropdownDispatcher';
import { svgIcon } from '../MDI';

export default class MarkDropdownDispatcher extends AbstractDropdownDispatcher {
    getMenuItem(schema) {
        return super.getMenuItem(schema, {
            icon: svgIcon('format-text'),
            label: LANG.plugins.prosemirror['label:marks'],
        });
    }
}
