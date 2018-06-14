class MenuView {
    /**
     * @param {[MenuItem]} items
     * @param {EditorView} editorView
     *
     * @return {void}
     */
    constructor(items, editorView) {
        this.items = items;
        this.editorView = editorView;

        this.dom = document.createElement('div');
        this.dom.className = 'menubar';
        items.forEach(menuItem => this.dom.appendChild(menuItem.render(editorView)));
        this.update(editorView);
    }

    /**
     * Called by Prosemirror when the state of the editor changes
     *
     * @param {EditorView} editorView
     *
     * @return {void}
     */
    update(editorView) {
        this.items.forEach((item) => {
            item.update(editorView);
        });
    }

    /**
     * Called by Prosemirror when the menu is removed
     *
     * @return {void}
     */
    destroy() {
        this.dom.remove();
    }
}

export default MenuView;
