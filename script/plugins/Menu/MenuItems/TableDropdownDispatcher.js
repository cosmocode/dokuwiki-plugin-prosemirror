import AbstractDropdownDispatcher from './AbstractDropdownDispatcher.js';
import { svgIcon } from '../MDI.js';

export default class TableDropdownDispatcher extends AbstractDropdownDispatcher {
    getMenuItem(schema) {
        return super.getMenuItem(schema, {
            icon: svgIcon('table-edit'),
            label: LANG.plugins.prosemirror['label:table-ops'],
        });
    }
}
