const { MediaForm } = require('./MediaForm');
const { AbstractNodeView } = require('./AbstractNodeView');

class MediaView extends AbstractNodeView {
    constructor(node, view, getPos) {
        super(node, view, getPos);

        this.MediaForm = new MediaForm();
    }

    renderNode(attrs) {
        if (attrs['data-resolvedHtml']) {
            const $mediaNode = jQuery(attrs['data-resolvedHtml']);
            $mediaNode.removeAttr('controls');
            this.dom = $mediaNode.get(0);

            jQuery(this.dom).on('click', (event) => {
                if (typeof event.ctrlKey === 'undefined' || !event.ctrlKey) {
                    event.preventDefault();
                }
            });

            return;
        }

        // FIXME this needs to be something meaningful -- maybe a spinner?
        this.dom = jQuery('<span>⌚</span>').get(0);
    }

    selectNode() {
        this.dom.classList.add('ProseMirror-selectednode');

        this.MediaForm.setSource(this.node.attrs.id);
        this.MediaForm.setCaption(this.node.attrs.title);
        this.MediaForm.setWidth(this.node.attrs.width);
        this.MediaForm.setHeight(this.node.attrs.height);

        this.MediaForm.setCache(this.node.attrs.cache);
        this.MediaForm.setAlignment(this.node.attrs.align);
        this.MediaForm.setLinking(this.node.attrs.linking);

        this.MediaForm.show();


        const cleanAttrs = AbstractNodeView.unsetPrefixAttributes('data-resolved', { ...this.node.attrs });
        this.MediaForm.on('submit', MediaForm.resolveSubmittedLinkData(
            cleanAttrs,
            this.MediaForm,
            (newAttrs) => {
                this.renderNode(newAttrs);
                const nodeStartPos = this.getPos();
                this.outerView.dispatch(this.outerView.state.tr.setNodeMarkup(
                    nodeStartPos,
                    null,
                    newAttrs,
                    this.node.marks,
                ));
            },
        ));
    }

    deselectNode() {
        this.dom.classList.remove('ProseMirror-selectednode');


        this.MediaForm.hide();
        this.MediaForm.off('submit');
        this.MediaForm.resetForm();
    }
}

exports.MediaView = MediaView;
