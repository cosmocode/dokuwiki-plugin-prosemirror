import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Node } from 'prosemirror-model';

import getKeymapPlugin from '../plugins/Keymap/keymap';

import AbstractNodeView from './AbstractNodeView';
import MenuInitializer from '../plugins/Menu/MenuInitializer';

// todo: Fix this cycle
import getNodeViews from './index'; // eslint-disable-line import/no-cycle
import footnoteSchema from './Footnote/footnoteSchema';

class FootnoteView extends AbstractNodeView {
    renderNode() {
        this.dom = jQuery('<sup class="footnote">').get(0);
        this.innerView = null;
        if (!this.tooltip) {
            // Append a tooltip to the outer node
            this.tooltip = jQuery('<div>').addClass('footnote-tooltip').appendTo('.dokuwiki').get(0);
        }
    }

    selectNode() {
        this.dom.classList.add('ProseMirror-selectednode');
        if (!this.innerView) {
            this.open();
        }
    }

    deselectNode() {
        this.dom.classList.remove('ProseMirror-selectednode');
        if (this.innerView) {
            this.dispatchOuter();
            this.close();
        }
    }

    open() {
        jQuery(this.tooltip).dialog({
            minWidth: 600,
            minHeight: 300,
            title: 'edit footnote',
            modal: true,
            appendTo: '.dokuwiki',
            close: this.dispatchOuter.bind(this),
        });
        // And put a sub-ProseMirror into that

        const mi = new MenuInitializer(footnoteSchema);
        this.innerView = new EditorView(this.tooltip, {
            // You can use any node as an editor document
            state: EditorState.create({
                doc: Node.fromJSON(footnoteSchema, JSON.parse(this.node.attrs.contentJSON)),
                footnoteSchema,
                plugins: [
                    mi.getMenuPlugin(),
                    getKeymapPlugin(footnoteSchema),
                ],
            }),
            // This is the magic part
            dispatchTransaction: this.dispatchInner.bind(this),
            handleDOMEvents: {
                mousedown: () => {
                    // Kludge to prevent issues due to the fact that the whole
                    // footnote is node-selected (and thus DOM-selected) when
                    // the parent editor is focused.
                    if (this.outerView.hasFocus()) {
                        this.innerView.focus();
                    }
                },
            },
            nodeViews: getNodeViews(),
        });
    }

    close() {
        if (!this.innerView) {
            return;
        }
        this.innerView.destroy();
        this.innerView = null;
        this.tooltip.innerHTML = '';
    }

    dispatchInner(tr) {
        const { state } = this.innerView.state.applyTransaction(tr);
        this.innerView.updateState(state);
    }

    dispatchOuter() {
        const newAttrs = { contentJSON: JSON.stringify(this.innerView.state.doc.toJSON()) };
        if (newAttrs.contentJSON.length === this.node.attrs.contentJSON.length) {
            return;
        }
        const nodeStartPos = this.getPos();
        this.outerView.dispatch(this.outerView.state.tr.setNodeMarkup(
            nodeStartPos,
            null,
            newAttrs,
        ));
    }


    update(node) {
        if (!node.sameMarkup(this.node)) {
            return false;
        }
        this.node = node;
        if (this.innerView) {
            const { state } = this.innerView;
            const start = node.content.findDiffStart(state.doc.content);
            if (start != null) {
                let { a: endA, b: endB } = node.content.findDiffEnd(state.doc.content);
                const overlap = start - Math.min(endA, endB);
                if (overlap > 0) {
                    endA += overlap;
                    endB += overlap;
                }
                this.innerView.dispatch(
                    state.tr
                        .replace(start, endB, node.slice(start, endA))
                        .setMeta('fromOutside', true),
                );
            }
        }
        return true;
    }


    destroy() {
        if (this.innerView) {
            this.close();
        }
    }

    stopEvent(event) {
        return this.innerView && this.innerView.dom.contains(event.target);
    }

    ignoreMutation() { // eslint-disable-line class-methods-use-this
        return true;
    }
}

export default FootnoteView;
