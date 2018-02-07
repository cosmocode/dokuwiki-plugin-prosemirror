class LinkPrompt {
    /**
     *
     * @param {Node} node
     * @param {EditorView} view
     * @param {function} getPos
     */
    constructor(node, view, getPos) {
        this.node = node;
        this.outerView = view;
        this.getPos = getPos;

        this.renderLink(node.attrs);
    }

    renderLink(attributes) {
        if (!this.dom) {
            this.dom = document.createElement('a');
            jQuery(this.dom).on('click', (event) => { event.preventDefault(); });
        }
        Object.entries(attributes).forEach(([name, value]) => {
            this.dom.setAttribute(name, value);
        });
        this.dom.setAttribute('style', 'cursor: text;');
        this.dom.textContent = attributes['data-name'];
    }

    selectNode() {
        this.dom.classList.add('ProseMirror-selectednode');
        this.$linkform = jQuery('#prosemirror-linkform');
        this.$linkform.find('#prosemirror-linktarget-input').val(this.node.attrs.href);

        this.$linkform.css('display', 'inline-block');

        this.$linkform.on('submit', (event) => {
            event.preventDefault();
            event.stopPropagation();

            const newAttrs = this.node.copy().attrs;

            newAttrs.href = this.$linkform.find('#prosemirror-linktarget-input').val();
            newAttrs.title = this.$linkform.find('#prosemirror-linktarget-input').val();
            const newTitle = this.$linkform.find('#prosemirror-linkname-input').val();
            if (newTitle) {
                newAttrs['data-name'] = newTitle;
            }
            const nodeStartPos = this.getPos();
            this.renderLink(newAttrs);
            this.outerView.dispatch(this.outerView.state.tr.setNodeMarkup(
                nodeStartPos,
                null,
                newAttrs,
                this.node.marks,
            ));
        });
    }

    deselectNode() {
        this.dom.classList.remove('ProseMirror-selectednode');
        this.$linkform.off('submit');

        this.$linkform.css('display', 'none');
    }
}

exports.LinkPrompt = LinkPrompt;
