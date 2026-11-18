// FIXME: prevent XSS!

import LinkForm from './LinkForm.js';
import AbstractNodeView from './AbstractNodeView.js';
import {
    getLinkDisplayAttributes,
    getLinkText,
    isImageLink,
} from '../linkHelpers.js';

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

        const display = getLinkDisplayAttributes(attributes, JSINFO.URL_SCHEMES);
        if (display.href) {
            this.dom.setAttribute('href', display.href);
        } else {
            // not "false": Ctrl+click would follow it as a relative URL
            this.dom.removeAttribute('href');
        }
        this.dom.setAttribute('title', display.title);

        Object.entries(attributes).forEach(([name, value]) => {
            if (name.substr(0, 'image-'.length) === 'image-') {
                return;
            }
            // setAttribute() would write the text "null"
            if (value === null || value === undefined) {
                this.dom.removeAttribute(name);
                return;
            }
            this.dom.setAttribute(name, value);
        });
        this.dom.setAttribute('style', 'cursor: text;');

        // name; data-resolvedImage is sanitised on paste, see sanitizeImageHtml()
        if (isImageLink(attributes) && !attributes['data-name']) {
            this.dom.innerHTML = attributes['data-resolvedImage'];
        } else {
            this.dom.textContent = getLinkText(attributes);
        }

        this.dom.setAttribute('class', display.class);
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

        this.linkForm.bindSubmitUntilClose(LinkForm.resolveSubmittedLinkData(
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
}

export default LinkView;
