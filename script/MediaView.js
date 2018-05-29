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
        this.MediaForm.on('submit', (event) => {
            event.preventDefault();

            // const newAttrs = this.node.copy().attrs;
            const newAttrs = AbstractNodeView.unsetPrefixAttributes('data-resolved', this.node.copy().attrs);

            newAttrs.id = this.MediaForm.getSource();
            newAttrs.title = this.MediaForm.getCaption();
            newAttrs.width = this.MediaForm.getWidth();
            newAttrs.height = this.MediaForm.getHeight();
            newAttrs.align = this.MediaForm.getAlignment();
            newAttrs.linking = this.MediaForm.getLinking();
            newAttrs.cache = this.MediaForm.getCache();

            jQuery.get(
                `${DOKU_BASE}/lib/exe/ajax.php`,
                {
                    call: 'plugin_prosemirror',
                    actions: ['resolveMedia'],
                    attrs: newAttrs,
                    id: JSINFO.id,
                },
            ).done((data) => {
                const parsedData = JSON.parse(data);
                newAttrs['data-resolvedHtml'] = parsedData.resolveMedia['data-resolvedHtml'];
                console.log(newAttrs);
                this.renderNode(newAttrs);

                const nodeStartPos = this.getPos();
                this.outerView.dispatch(this.outerView.state.tr.setNodeMarkup(
                    nodeStartPos,
                    null,
                    newAttrs,
                    this.node.marks,
                ));
            });

            console.log(this.MediaForm.getCache());
        });
    }

    deselectNode() {
        this.dom.classList.remove('ProseMirror-selectednode');


        this.MediaForm.hide();
        this.MediaForm.off('submit');
        this.MediaForm.resetForm();
    }
}

exports.MediaView = MediaView;
