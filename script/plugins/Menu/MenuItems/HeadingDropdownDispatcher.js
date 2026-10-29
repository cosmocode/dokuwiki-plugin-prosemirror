import AbstractDropdownDispatcher from './AbstractDropdownDispatcher.js';
import { svgIcon } from '../MDI.js';

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
