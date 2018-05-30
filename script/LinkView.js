// FIXME: prevent XSS!

const { LinkForm } = require('./LinkForm');
const { AbstractNodeView } = require('./AbstractNodeView');

class LinkView extends AbstractNodeView {
    /**
     *
     * @param {Node} node
     * @param {EditorView} view
     * @param {function} getPos
     */
    constructor(node, view, getPos) {
        super(node, view, getPos);

        this.linkForm = new LinkForm();
    }

    renderNode(attributes) {
        if (!this.dom) {
            this.dom = document.createElement('a');
            jQuery(this.dom).on('click', (event) => {
                if (typeof event.ctrlKey === 'undefined' || !event.ctrlKey) {
                    event.preventDefault();
                }
            });
        }

        // href
        if (attributes['data-resolvedUrl']) {
            this.dom.setAttribute('href', attributes['data-resolvedUrl']);
        } else {
            this.dom.setAttribute(
                'href',
                LinkView.transformInnerToHref(
                    attributes['data-type'],
                    attributes['data-resolvedID'] || attributes['data-inner'],
                ),
            );
        }

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

        const isImage = attributes['image-id'] && attributes['image-id'].length > 0;
        console.log(`isImage: ${isImage}`);
        // name
        if (attributes['data-name']) {
            this.dom.textContent = attributes['data-name'];
        } else if (isImage) {
            this.dom.innerHTML = attributes['data-resolvedImage']; // FIXME: XSS?
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
        this.linkForm.setLinkTarget(this.node.attrs['data-type'], this.node.attrs['data-inner']);

        if (this.node.attrs['data-name']) {
            this.linkForm.setLinkNameType('custom', this.node.attrs['data-name']);
        } else if (this.node.attrs['image-id']) {
            this.linkForm.setLinkNameType(
                'image',
                Object.entries(this.node.attrs)
                    .filter(([key, value]) => key.substr(0, 'image-'.length) === 'image-' && value)
                    .reduce((carry, [key, value]) => ({ ...carry, [key.substr('image-'.length)]: value }), {}),
            );
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
            newAttrs = LinkView.unsetPrefixAttributes('image-', newAttrs);
            if (nameType === 'custom') {
                newAttrs['data-name'] = this.linkForm.getLinkName();
            }
            if (nameType === 'automatic') {
                delete newAttrs['data-name'];
            }
            const actions = [];
            const params = {};
            const image = {};
            if (nameType === 'image') {
                delete newAttrs['data-name'];
                actions.push('resolveImageTitle');
                // image caption?
                image.id = this.linkForm.MediaForm.getSource();
                image.title = this.linkForm.MediaForm.getCaption();
                image.width = this.linkForm.MediaForm.getWidth();
                image.height = this.linkForm.MediaForm.getHeight();
                image.align = this.linkForm.MediaForm.getAlignment();
                image.cache = this.linkForm.MediaForm.getCache();
                params.image = image;
                newAttrs = Object.entries(image)
                    .reduce((carry, [key, value]) => ({ ...carry, [`image-${key}`]: value }), newAttrs);
            }

            if (newAttrs['data-type'] === 'internallink') {
                actions.push('resolveInternalLink');
            }

            if (newAttrs['data-type'] === 'interwikilink') {
                actions.push('resolveInterWikiLink');
            }

            if (actions.length) {
                jQuery.get(
                    `${DOKU_BASE}/lib/exe/ajax.php`,
                    {
                        call: 'plugin_prosemirror',
                        actions,
                        inner: newAttrs['data-inner'],
                        id: JSINFO.id,
                        ...params,
                    },
                ).done((data) => {
                    console.log(JSON.parse(data));

                    // FIXME handle aggregated data
                    const parsedData = JSON.parse(data);
                    if (parsedData.resolveInternalLink) {
                        const {
                            id, exists, heading,
                        } = parsedData.resolveInternalLink;
                        newAttrs['data-resolvedID'] = id;
                        newAttrs['data-resolvedTitle'] = id;
                        newAttrs['data-resolvedClass'] = exists ? 'wikilink1' : 'wikilink2';
                        if (nameType === 'automatic') {
                            newAttrs['data-resolvedName'] = heading;
                        }
                    }
                    if (parsedData.resolveInterWikiLink) {
                        const {
                            url, resolvedClass,
                        } = parsedData.resolveInterWikiLink;
                        newAttrs['data-resolvedUrl'] = url;
                        newAttrs['data-resolvedClass'] = resolvedClass;
                    }
                    if (parsedData.resolveImageTitle) {
                        newAttrs['data-resolvedImage'] = parsedData.resolveImageTitle['data-resolvedImage'];
                    }

                    this.renderNode(newAttrs);
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

            this.renderNode(newAttrs);
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

    /**
     * It is not clear when this method is actually called by ProseMirror
     * However, it is clear that this does not necesarily mean that this javascript object
     * is destroyed or no longer in use. Specifically we have to ensure that
     * this.linkForm remains usable
     *
     * https://prosemirror.net/docs/ref/#state.PluginSpec.view^returns.destroy
     */
    destroy() { // eslint-disable-line class-methods-use-this
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
        case 'other':
            if (inner.substr(0, '\\\\'.length) === '\\\\') {
                return `file:///${inner.replace('\\', '/')}`;
            }
            return inner;
        default:
            console.log(`unknown linktype: ${linktype}`);
            return false;
        }
    }

    static getDefaultNameFromInner(linktype, inner) {
        switch (linktype) {
        case 'externallink':
        case 'other':
        case 'emaillink':
            return inner;
        case 'interwikilink': {
            return inner.split(/>/)[1];
        }
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
        case 'other':
        case 'emaillink':
        case 'interwikilink':
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
        case 'interwikilink':
        case 'internallink':
            return ''; // FIXME we need ajax to show whether the page exists or not
        case 'other':
            return 'windows'; // FIXME what could other possible uses for 'other' be?
        default:
            console.log(`unknown linktype to return class from: ${linktype}`);
            return false;
        }
    }
}

exports.LinkView = LinkView;
