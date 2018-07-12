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

    renderNode(attrs) {
        if (!this.dom) {
            this.dom = document.createElement('pre');
            const $settingsButton = jQuery('<button>', { type: 'button', class: 'settings' }).text('settings');
            $settingsButton.on('click', () => {
                this.form.show();
            });
            jQuery(this.dom)
                .text('RSS: ')
                .append(jQuery('<span class="url">'))
                .append($settingsButton);
        }
        jQuery(this.dom).find('.url').text(attrs.url);
    }
}

export default RSSView;
