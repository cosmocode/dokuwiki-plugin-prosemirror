class MenuView {
    constructor(items, editorView) {
        this.items = items;
        this.editorView = editorView;

        this.dom = document.createElement('div');
        this.dom.className = 'menubar';
        items.forEach(menuItem => this.dom.appendChild(menuItem.render(editorView)));
        this.update(editorView);
    }

    update(editorView) {
        this.items.forEach((item) => {
            item.update(editorView);
        });
    }

    destroy() {
        this.dom.remove();
    }
}

export default MenuView;
