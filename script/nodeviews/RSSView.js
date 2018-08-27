import AbstractNodeView from './AbstractNodeView';
import KeyValueForm from './KeyValueForm';

class RSSView extends AbstractNodeView {
    static getFields(attr) {
        return [
            {
                label: LANG.plugins.prosemirror['label:rss url'],
                type: 'url',
                name: 'url',
                required: true,
                value: attr.url,
            },
            {
                label: LANG.plugins.prosemirror['label:rss nOfItems'],
                type: 'number',
                min: '1',
                name: 'max',
                value: attr.max,
            },
            {
                label: LANG.plugins.prosemirror['label:rss reverse'],
                type: 'checkbox',
                name: 'reverse',
                value: '1',
                checked: attr.reverse,
            },
            {
                label: LANG.plugins.prosemirror['label:rss author'],
                name: 'author',
                type: 'checkbox',
                value: '1',
                checked: attr.author,
            },
            {
                label: LANG.plugins.prosemirror['label:rss date'],
                name: 'date',
                type: 'checkbox',
                value: '1',
                checked: attr.date,
            },
            {
                label: LANG.plugins.prosemirror['label:rss details'],
                name: 'details',
                type: 'checkbox',
                value: '1',
                checked: attr.details,
            },
            {
                label: LANG.plugins.prosemirror['label:rss refresh'],
                name: 'refresh',
                type: 'text',
                placeholder: '4h',
                value: attr.refresh,
            },
        ];
    }

    constructor(node, view, getPos) {
        super(node, view, getPos);

        this.form = new KeyValueForm(
            LANG.plugins.prosemirror.rssConfig,
            RSSView.getFields(node.attrs),
        );
        this.form.on('submit', this.handleFormSubmit.bind(this));
    }

    handleFormSubmit(event) {
        event.preventDefault();
        event.stopPropagation();

        const attrs = this.form.$form.serializeArray().reduce((acc, { name, value }) => {
            acc[name] = value;
            return acc;
        }, {});

        this.form.hide();
        this.outerView.dispatch(this.outerView.state.tr
            .setNodeMarkup(
                this.getPos(),
                null,
                attrs,
                this.node.marks,
            ));
    }

    /**
     * Send this node's attributes to the server to get the rendered html back
     *
     * @param {object} attrs
     */
    retrieveRenderedHTML(attrs) {
        const ajaxEndpoint = `${DOKU_BASE}lib/exe/ajax.php`;
        jQuery.post(ajaxEndpoint, {
            call: 'plugin_prosemirror',
            actions: ['resolveRSS'],
            attrs: JSON.stringify(attrs),
            contentType: 'application/json',
        }).done((data) => {
            const renderedHTML = data.resolveRSS;
            const newAttrs = {
                ...attrs,
                renderedHTML,
            };
            this.outerView.dispatch(
                this.outerView.state.tr
                    .setNodeMarkup(
                        this.getPos(),
                        null,
                        newAttrs,
                        this.node.marks,
                    ),
            );
        });
    }

    renderNode(attrs) {
        if (!this.dom) {
            const $dom = jQuery('<div>').addClass('nodeHasForm');
            $dom.on('click', () => {
                this.form.show();
            });
            this.dom = $dom.get(0);
        }
        if (!attrs.renderedHTML) {
            this.retrieveRenderedHTML(attrs, this);
            // FIXME add throbber while loading
        } else {
            jQuery(attrs.renderedHTML).css('pointer-events', 'none').appendTo(this.dom);
        }
    }
}

export default RSSView;
