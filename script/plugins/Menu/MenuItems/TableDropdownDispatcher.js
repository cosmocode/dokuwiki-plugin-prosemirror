import AbstractDropdownDispatcher from './AbstractDropdownDispatcher';
import { svgIcon } from '../MDI';

export default class TableDropdownDispatcher extends AbstractDropdownDispatcher {
    getMenuItem(schema) {
        return super.getMenuItem(schema, {
            icon: svgIcon('table-edit'),
            label: LANG.plugins.prosemirror['label:table-ops'],
        });
    }
}
