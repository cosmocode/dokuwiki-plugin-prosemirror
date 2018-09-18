import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher';
import MenuItem from '../MenuItem';
import SetDocAttrStep from '../../../custom/SetDocAttrStep';
import { svgIcon } from '../MDI';

export default class PageMacroMenuItemDispatcher extends AbstractMenuItemDispatcher {
    /**
     * Create an MenuItemDispatcher to toggle the state of a page macro
     *
     * @param {string} macro The page macro, should be either NOCACHE or NOTOC
     */
    constructor(macro) {
        super();
        this.macro = macro;
    }

    isAvailable({ nodes }) {
        return !!nodes.doc.attrs[this.macro.toLowerCase()];
    }

    getMenuItem({ nodes }) {
        if (!this.isAvailable({ nodes })) {
            throw new Error('Plugin block not available in schema!');
        }
        const macroAttrName = this.macro.toLowerCase();
        return new MenuItem({
            command: (state, dispatch) => {
                if (dispatch) {
                    const newState = !state.doc.attrs[macroAttrName];
                    const { tr } = state;
                    tr.step(new SetDocAttrStep(macroAttrName, newState));
                    dispatch(tr);
                }
                return true;
            },
            render: () => {
                const label = LANG.plugins.prosemirror[`label:${macroAttrName}`];
                const blankIcon = MenuItem.renderSVGIcon(svgIcon('checkbox-blank-outline'), label)
                    .addClass('is-false');
                const checkedIcon = MenuItem.renderSVGIcon(svgIcon('checkbox-marked-outline'), label)
                    .addClass('is-true');
                const dom = jQuery('<span>').addClass('menuitem');
                dom.append(blankIcon);
                dom.append(checkedIcon);
                dom.append(jQuery('<span>')
                    .addClass('menulabel')
                    .text(label));
                return dom.get(0);
            },
            update: (editorView, dom) => {
                const $dom = jQuery(dom);
                const attrState = editorView.state.doc.attrs[macroAttrName];
                $dom.find('.is-true').toggle(attrState);
                $dom.find('.is-false').toggle(!attrState);
            },
            isActive: state => state.doc.attrs[macroAttrName],
        });
    }
}
