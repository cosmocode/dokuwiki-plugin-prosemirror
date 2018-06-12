const { Plugin } = require('prosemirror-state');
const { MenuView } = require('./MenuView');

function MenuPlugin(items) {
    return new Plugin({
        view(editorView) {
            const menuView = new MenuView(items, editorView);
            editorView.dom.parentNode.insertBefore(menuView.dom, editorView.dom);
            return menuView;
        },
    });
}

exports.MenuPlugin = MenuPlugin;
