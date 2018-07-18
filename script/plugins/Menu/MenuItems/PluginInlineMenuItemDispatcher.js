import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher';
import { svgIcon } from '../MDI';
import MenuItem from '../MenuItem';

export default class PluginInlineMenuItemDispatcher extends AbstractMenuItemDispatcher {
    static isAvailable(schema) {
        return !!schema.nodes.dwplugin_inline;
    }

    static getMenuItem(schema) {
        if (!this.isAvailable(schema)) {
            throw new Error('Generic inline plugin nodes not available in Schema!');
        }

        return new MenuItem({
            command: (state, dispatch) => {
                const { $from } = state.selection;

                const index = $from.index();
                if (!$from.parent.canReplaceWith(index, index, schema.nodes.dwplugin_inline)) {
                    return false;
                }
                if (dispatch) {
                    let textContent = '';
                    state.selection.content().content.descendants((node) => {
                        textContent += node.textContent;
                        return false;
                    });
                    if (!textContent.length) {
                        textContent = 'FIXME';
                    }

                    dispatch(state.tr.replaceSelectionWith(schema.nodes.dwplugin_inline.createChecked(
                        {},
                        schema.text(textContent),
                    )));
                }
                return true;
            },
            icon: svgIcon('puzzle'),
            label: 'Plugin inline',
        });
    }
}
