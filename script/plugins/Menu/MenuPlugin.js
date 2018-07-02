import { Plugin } from 'prosemirror-state';
import MenuView from './MenuView';

/**
 * Create a new menu plugin from the given items
 *
 * @param {[MenuItem]} items The items tp be displayed in the menu
 *
 * @return {Plugin} a new Prosemirror Plugin
 *
 * @constructor
 */
function MenuPlugin(items) {
    return new Plugin({
        view(editorView) {
            const menuView = new MenuView(items, editorView);
            editorView.dom.parentNode.insertBefore(menuView.dom, editorView.dom);
            return menuView;
        },
    });
}

export default MenuPlugin;
