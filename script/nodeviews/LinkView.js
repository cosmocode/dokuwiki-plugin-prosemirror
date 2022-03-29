// FIXME: prevent XSS!

import LinkForm from './LinkForm';
import AbstractNodeView from './AbstractNodeView';

class LinkView extends AbstractNodeView {
    /**
     *
     * @param {Node} node
     * @param {EditorView} view
     * @param {function} getPos
     */
    constructor(node, view, getPos) {
        super(node, view, getPos);

        this.linkForm = LinkForm.getInstance();
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
        jQuery(this.dom).addClass('nodeHasForm');
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
        let cleanedAttrs = this.node.copy().attrs;
        cleanedAttrs = LinkView.unsetPrefixAttributes('data-resolved', cleanedAttrs);
        cleanedAttrs = LinkView.unsetPrefixAttributes('image-', cleanedAttrs);

        this.linkForm.on('submit', LinkForm.resolveSubmittedLinkData(
            this.linkForm,
            cleanedAttrs,
            (newAttrs) => {
                this.renderNode(newAttrs);
                const nodeStartPos = this.getPos();
                this.outerView.dispatch(this.outerView.state.tr.setNodeMarkup(
                    nodeStartPos,
                    null,
                    newAttrs,
                    this.node.marks,
                ));
                this.deselectNode();
            },
        ));
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

export default LinkView;
