import AbstractDropdownDispatcher from './AbstractDropdownDispatcher';
import { svgIcon } from '../MDI';

class PageMacroDropdownDispatcher extends AbstractDropdownDispatcher {
    getMenuItem(schema) {
        return super.getMenuItem(schema, {
            icon: svgIcon('settings-outline'),
            label: LANG.plugins.prosemirror['label:settings'],
        });
    }
}

export default PageMacroDropdownDispatcher;
