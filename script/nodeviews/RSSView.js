import AbstractNodeView from './AbstractNodeView';
import KeyValueForm from './KeyValueForm';

class RSSView extends AbstractNodeView {
    static getFields(attr) {
        return [
            {
                label: 'url',
                type: 'url',
                name: 'url',
                required: true,
                value: attr.url,
            },
            {
                label: 'maximum number items to show',
                type: 'number',
                min: '1',
                name: 'max',
                value: attr.max,
            },
            {
                label: 'display the last items in the feed first ',
                type: 'checkbox',
                name: 'reverse',
                value: '1',
                checked: attr.reverse,
            },
            {
                label: 'show item authors names',
                name: 'author',
                type: 'checkbox',
                value: '1',
                checked: attr.author,
            },
            {
                label: 'show item dates',
                name: 'date',
                type: 'checkbox',
                value: '1',
                checked: attr.date,
            },
            {
                label: 'show the item description',
                name: 'details',
                type: 'checkbox',
                value: '1',
                checked: attr.details,
            },
            {
                label: 'refresh period',
                name: 'refresh',
                type: 'text',
                value: attr.refresh,
            },
        ];
    }

    constructor(node, view, getPos) {
        super(node, view, getPos);

        this.form = new KeyValueForm(
            'RSS-Feed Configuration',
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
