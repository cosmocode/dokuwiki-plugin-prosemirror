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
            jQuery(this.dom).on('click', (event) => {
                if (typeof event.ctrlKey === 'undefined' || !event.ctrlKey) {
                    event.preventDefault();
                }
            });
        }

        // href
        this.dom.setAttribute(
            'href',
            LinkView.transformInnerToHref(
                attributes['data-type'],
                attributes['data-resolvedID'] || attributes['data-inner'],
            ),
        );

        // title
        if (attributes['data-resolvedTitle']) {
            this.dom.setAttribute('title', attributes['data-resolvedTitle']);
        } else {
            this.dom.setAttribute(
                'title',
                LinkView.getTitleFromInner(attributes['data-type'], attributes['data-inner']),
            );
        }

        Object.entries(attributes).forEach(([name, value]) => {
            if (name.substr(0, 'image-'.length) === 'image-') {
                return;
            }
            this.dom.setAttribute(name, value);
        });
        this.dom.setAttribute('style', 'cursor: text;');

        const isImage = attributes['image-src'] && attributes['image-src'].length > 0;

        // name
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
        } else if (attributes['data-resolvedName']) {
            this.dom.textContent = attributes['data-resolvedName'];
        } else {
            this.dom.textContent = LinkView.getDefaultNameFromInner(attributes['data-type'], attributes['data-inner']);
        }

        // class
        if (isImage) {
            this.dom.setAttribute('class', 'media');
        } else if (attributes['data-resolvedClass']) {
            this.dom.setAttribute('class', attributes['data-resolvedClass']);
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

            let newAttrs = this.node.copy().attrs;
            newAttrs = LinkView.unsetPrefixAttributes('data-resolved', newAttrs);

            newAttrs['data-inner'] = this.linkForm.getLinkTarget();
            newAttrs['data-type'] = this.linkForm.getLinkType();
            const nameType = this.linkForm.getLinkNameType();
            if (nameType === 'custom') {
                newAttrs['data-name'] = this.linkForm.getLinkName();
                newAttrs = LinkView.unsetPrefixAttributes('image-', newAttrs);
            }
            if (nameType === 'automatic') {
                delete newAttrs['data-name'];
                newAttrs = LinkView.unsetPrefixAttributes('image-', newAttrs);
            }

            if (newAttrs['data-type'] === 'internallink') {
                jQuery.get(
                    `${DOKU_BASE}/lib/exe/ajax.php`,
                    {
                        call: 'plugin_prosemirror',
                        action: 'resolveLink',
                        inner: newAttrs['data-inner'],
                        id: JSINFO.id,
                    },
                ).done((data) => {
                    const {
                        id, exists, heading,
                    } = JSON.parse(data);
                    newAttrs['data-resolvedID'] = id;
                    newAttrs['data-resolvedTitle'] = id;
                    newAttrs['data-resolvedClass'] = exists ? 'wikilink1' : 'wikilink2';
                    if (nameType === 'automatic') {
                        newAttrs['data-resolvedName'] = heading;
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

                return;
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

    static unsetPrefixAttributes($prefix, attributes) {
        const cleanedAttributes = {};
        Object.keys(attributes).forEach((attr) => {
            if (attr.substr(0, $prefix.length) !== $prefix) {
                cleanedAttributes[attr] = attributes[attr];
            }
        });
        return cleanedAttributes;
    }


    static transformInnerToHref(linktype, inner) {
        switch (linktype) {
        case 'externallink':
            return inner;
        case 'emaillink':
            return `mailto:${inner}`;
        case 'internallink': {
            return `${DOKU_BASE}doku.php?id=${inner.replace('?', '&')}`;
        }
        default:
            console.log(`unknown linktype: ${linktype}`);
            return false;
        }
    }

    static getDefaultNameFromInner(linktype, inner) {
        switch (linktype) {
        case 'externallink':
        case 'emaillink':
            return inner;
        case 'internallink': { // FIXME we have to get the actual name from the server via ajax
            const id = inner.split(/[?|#]/)[0];
            return id.split(':').pop();
        }
        default:
            console.warn(`unknown linktype: ${linktype}`);
            return false;
        }
    }

    static getTitleFromInner(linktype, inner) {
        switch (linktype) {
        case 'externallink':
        case 'emaillink':
            return inner;
        case 'internallink': { // FIXME we have to get the actual title for relative links from the server via ajax
            const id = inner.split(/[?|#]/)[0];
            return id;
        }
        default:
            console.warn(`unknown linktype: ${linktype}`);
            return false;
        }
    }

    static getClassFromType(linktype) {
        switch (linktype) {
        case 'externallink':
            return 'urlextern';
        case 'emaillink':
            return 'mail';
        case 'internallink':
            return ''; // FIXME we need ajax to show whether the page exists or not
        default:
            console.log(`unknown linktype to return class from: ${linktype}`);
            return false;
        }
    }
}

exports.LinkView = LinkView;
