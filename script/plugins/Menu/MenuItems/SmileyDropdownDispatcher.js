import AbstractDropdownDispatcher from './AbstractDropdownDispatcher.js';
import { svgIcon } from '../MDI.js';

export default class SmileyDropdownDispatcher extends AbstractDropdownDispatcher {
    getMenuItem(schema) {
        return super.getMenuItem(schema, {
            icon: svgIcon('emoticon'),
            label: LANG.plugins.prosemirror['label:smileys'],
        });
    }
}
