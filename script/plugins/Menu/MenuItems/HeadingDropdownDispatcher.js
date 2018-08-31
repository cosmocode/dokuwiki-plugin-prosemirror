import AbstractDropdownDispatcher from './AbstractDropdownDispatcher';
import { svgIcon } from '../MDI';

export default class HeadingDropdownDispatcher extends AbstractDropdownDispatcher {
    getMenuItem(schema) {
        return super.getMenuItem(
            schema,
            {
                icon: svgIcon('format-header-pound'),
                label: LANG.plugins.prosemirror['label:headings'],
            },
        );
    }
}
