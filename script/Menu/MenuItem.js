/**
 * Create a new MenuItem
 *
 * The constructor needs the following keys:
 *
 * command: must be command function created by prosemirror-commands or similar
 */
class MenuItem {
    isActive() { // eslint-disable-line class-methods-use-this
        return false;
    }

    constructor(options = {}) {
        if (typeof options.command !== 'function') {
            throw new Error('command is not a function!');
        }

        this.options = options;

        if (typeof options.isActive === 'function') {
            this.isActive = options.isActive;
        }
    }

    render(editorView) {
        let dom;
        if (typeof this.options.render === 'function') {
            dom = this.options.render(editorView);
        } else if (this.options.icon instanceof Element) {
            dom = MenuItem.renderSVGIcon(this.options.icon, this.options.label);
        } else if (typeof this.options.label === 'string') {
            dom = jQuery('<span>')
                .addClass('menuitem menulabel')
                .attr('title', this.options.label)
                .text(this.options.label[0])
                .get(0);
        }

        dom.addEventListener('mousedown', (e) => {
            e.preventDefault();
            // editorView.focus();
            this.options.command(editorView.state, editorView.dispatch, editorView);
        });

        this.dom = dom;
        return dom;
    }

    update(editorView) {
        if (typeof this.options.update === 'function') {
            this.options.update(editorView);
        }

        if (this.isActive(editorView.state)) {
            this.dom.classList.add('is-active');
        } else {
            this.dom.classList.remove('is-active');
        }
        this.dom.style.display = this.options.command(editorView.state, null, editorView) ? '' : 'none';
    }

    /**
     * Add classes and title (if available) to the icon
     *
     * @param {HTMLSpanElement} icon <span>-element with the icon inside
     * @param {string} title Title to display
     * @return {HTMLSpanElement}
     */
    static renderSVGIcon(icon, title = '') {
        const $span = jQuery('<span>');
        $span.addClass('menuitem');
        $span.append(jQuery(icon).addClass('menuicon').attr('title', title));
        if (title) {
            $span.append(jQuery('<span>').text(title).addClass('menulabel'));
        }
        return $span.get(0);
    }
}

export default MenuItem;
