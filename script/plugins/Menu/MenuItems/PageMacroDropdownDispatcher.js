import AbstractDropdownDispatcher from './AbstractDropdownDispatcher.js';
import { svgIcon } from '../MDI.js';

class PageMacroDropdownDispatcher extends AbstractDropdownDispatcher {
    getMenuItem(schema) {
        return super.getMenuItem(schema, {
            icon: svgIcon('settings-outline'),
            label: LANG.plugins.prosemirror['label:settings'],
        });
    }
}

export default PageMacroDropdownDispatcher;
