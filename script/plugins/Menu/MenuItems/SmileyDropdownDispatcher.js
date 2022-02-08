import AbstractDropdownDispatcher from './AbstractDropdownDispatcher';
import { svgIcon } from '../MDI';

export default class SmileyDropdownDispatcher extends AbstractDropdownDispatcher {
    getMenuItem(schema) {
        return super.getMenuItem(schema, {
            icon: svgIcon('emoticon'),
            label: LANG.plugins.prosemirror['label:smileys'],
            cssClass: ['smileys'],
        });
    }
}
