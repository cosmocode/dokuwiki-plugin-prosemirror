// FIXME: prevent XSS!

const { LinkForm } = require('./LinkForm');

class LinkView {
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

        this.linkForm = new LinkForm();
    }

    renderLink(attributes) {
        if (!this.dom) {
            this.dom = document.createElement('a');
            jQuery(this.dom).on('click', (event) => { event.preventDefault(); });
        }
        Object.entries(attributes).forEach(([name, value]) => {
            if (name.substr(0, 'image-'.length) === 'image-') {
                return;
            }
            this.dom.setAttribute(name, value);
        });
        this.dom.setAttribute('style', 'cursor: text;');
        if (attributes['data-name']) {
            this.dom.textContent = attributes['data-name'];
        } else if (attributes['image-src']) {
            this.dom.innerHTML = '';
            const image = document.createElement('img');

            Object.entries(attributes).forEach(([name, value]) => {
                if (name.substr(0, 'image-'.length) === 'image-' && value !== null) {
                    image.setAttribute(name.substr('image-'.length), value);
                }
            });

            this.dom.appendChild(image);
        } else {
            this.dom.textContent = attributes.href;
        }
    }

    selectNode() {
        this.dom.classList.add('ProseMirror-selectednode');

        this.linkForm.setLinkType('external');
        this.linkForm.setLinkTarget(this.node.attrs.href);

        if (this.node.attrs['data-name']) {
            this.linkForm.setLinkNameType('custom', this.node.attrs['data-name']);
        }

        this.linkForm.show();

        this.linkForm.on('submit', (event) => {
            event.preventDefault();
            event.stopPropagation();

            const newAttrs = this.node.copy().attrs;

            newAttrs.href = this.linkForm.getLinkTarget();
            newAttrs.title = this.linkForm.getLinkTarget();
            const newTitle = this.linkForm.getLinkName();
            if (newTitle) {
                newAttrs['data-name'] = newTitle;
                // fixme: adjust class to urlextern if no longer media!
                Object.keys(newAttrs).forEach((attr) => {
                    if (attr.substr(0, 'image-'.length) === 'image-') {
                        delete newAttrs[attr];
                    }
                });
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

        this.linkForm.off('submit');
        this.linkForm.hide();
        this.linkForm.resetForm();
    }
}

exports.LinkView = LinkView;
