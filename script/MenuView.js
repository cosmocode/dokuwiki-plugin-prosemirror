class MenuView {
    constructor(items, editorView) {
        this.items = items;
        this.editorView = editorView;

        this.dom = document.createElement('div');
        this.dom.className = 'menubar';
        items.forEach(({ dom }) => this.dom.appendChild(dom));
        this.update();

        this.dom.addEventListener('mousedown', (e) => {
            e.preventDefault();
            editorView.focus();
            items.forEach(({ command, dom }) => {
                if (dom.contains(e.target)) { command(editorView.state, editorView.dispatch, editorView); }
            });
        });
    }

    update() {
        this.items.forEach(({ command, dom, isActive }) => {
            const enabled = command(this.editorView.state, null, this.editorView);
            if (!enabled) {
                dom.style.display = 'none'; // eslint-disable-line no-param-reassign
                return;
            }
            dom.style.display = ''; // eslint-disable-line no-param-reassign
            if (isActive && isActive(this.editorView.state, this.editorView)) {
                dom.classList.add('is-active');
            } else {
                dom.classList.remove('is-active');
            }
        });
    }

    destroy() {
        this.dom.remove();
    }
}

exports.MenuView = MenuView;
