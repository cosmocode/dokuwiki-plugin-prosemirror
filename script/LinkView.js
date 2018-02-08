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
        this.dom.setAttribute('href', LinkView.transformInnerToHref(attributes['data-type'], attributes['data-inner']));
        this.dom.setAttribute('title', attributes['data-inner']);

        Object.entries(attributes).forEach(([name, value]) => {
            if (name.substr(0, 'image-'.length) === 'image-') {
                return;
            }
            this.dom.setAttribute(name, value);
        });
        this.dom.setAttribute('style', 'cursor: text;');

        const isImage = attributes['image-src'] && attributes['image-src'].length > 0;

        if (attributes['data-name']) {
            this.dom.textContent = attributes['data-name'];
        } else if (isImage) {
            this.dom.innerHTML = '';
            const image = document.createElement('img');

            Object.entries(attributes).forEach(([name, value]) => {
                if (name.substr(0, 'image-'.length) === 'image-' && value !== null) {
                    image.setAttribute(name.substr('image-'.length), value);
                }
            });

            this.dom.appendChild(image);
        } else {
            this.dom.textContent = attributes['data-inner'];
        }

        if (isImage) {
            this.dom.setAttribute('class', 'media');
        } else {
            this.dom.setAttribute('class', LinkView.getClassFromType(attributes['data-type']));
        }
    }

    selectNode() {
        this.dom.classList.add('ProseMirror-selectednode');

        this.linkForm.setLinkType(this.node.attrs['data-type']);
        this.linkForm.setLinkTarget(this.node.attrs['data-inner']);

        if (this.node.attrs['data-name']) {
            this.linkForm.setLinkNameType('custom', this.node.attrs['data-name']);
        }

        this.linkForm.show();

        this.linkForm.on('submit', (event) => {
            event.preventDefault();
            event.stopPropagation();

            const newAttrs = this.node.copy().attrs;

            const linkType = this.linkForm.getLinkType();
            const linkTarget = this.linkForm.getLinkTarget();
            newAttrs['data-inner'] = linkTarget;
            newAttrs['data-type'] = linkType;
            const nameType = this.linkForm.getLinkNameType();
            const newTitle = this.linkForm.getLinkName();
            if (nameType === 'custom') {
                newAttrs['data-name'] = newTitle;
                Object.keys(newAttrs).forEach((attr) => {
                    if (attr.substr(0, 'image-'.length) === 'image-') {
                        delete newAttrs[attr];
                    }
                });
            }
            if (nameType === 'automatic') {
                delete newAttrs['data-name'];
                Object.keys(newAttrs).forEach((attr) => {
                    if (attr.substr(0, 'image-'.length) === 'image-') {
                        delete newAttrs[attr];
                    }
                });
            }

            this.renderLink(newAttrs);
            const nodeStartPos = this.getPos();
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


    static transformInnerToHref(linktype, inner) {
        switch (linktype) {
        case 'externallink':
            return inner;
        case 'emaillink':
            return `mailto:${inner}`;
        default:
            console.log(`unknown linktype: ${linktype}`);
            return false;
        }
    }

    static getClassFromType(linktype) {
        switch (linktype) {
        case 'externallink':
            return 'urlextern';
        case 'emaillink':
            return 'mail';
        default:
            console.log(`unknown linktype to return class from: ${linktype}`);
            return false;
        }
    }
}

exports.LinkView = LinkView;
