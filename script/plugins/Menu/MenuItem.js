class MenuItem {
    /**
     * Determine if this MenuItem is currently active at the cursor position
     *
     * @param {EditorState} editorState The current EditorView.state
     *
     * @return {boolean}
     */
    isActive(editorState) { // eslint-disable-line class-methods-use-this,no-unused-vars
        return false;
    }

    /**
     * Create a new MenuItem
     *
     * The constructor needs the following keys:
     *
     * command: must be command function created by prosemirror-commands or similar
     *
     * It should have at least one of the following:
     * render: a function that gets the EditorView and returns a DOM node
     * icon: an Element that contains an icon for the menu-button (ideally inline svg)
     * label: A human readable label for the menu item
     *
     * Optional:
     * isActive: A function that gets the EditorView and returns true if the item as active and false otherwise
     * update: A function that is called on update, gets the EditorView and this.dom and can change the latter
     *
     * @param {object} options
     */
    constructor(options = {}) {
        if (typeof options.command !== 'function') {
            throw new Error('command is not a function!');
        }

        this.options = options;

        if (typeof options.isActive === 'function') {
            this.isActive = options.isActive;
        }
    }

    /**
     * Render the menu icon and attach listeners
     *
     * @param {EditorView} editorView
     * @return {Element}
     */
    render(editorView) {
        const dom = this.renderDOM(editorView);
        if (!dom) {
            throw new Error(`Could not generate dom for ${this.options.label} ${JSON.stringify(this.options)}`);
        }

        dom.addEventListener('mousedown', (e) => {
            e.preventDefault();
            // editorView.focus();
            this.options.command(editorView.state, editorView.dispatch, editorView);
        });

        this.dom = dom;
        return dom;
    }

    renderDOM(editorView) {
        let dom;
        if (typeof this.options.render === 'function') {
            dom = this.options.render(editorView);
        } else {
            dom = jQuery('<span>').addClass('menuitem');
            if (this.options.icon instanceof Element) {
                dom.append(MenuItem.renderSVGIcon(this.options.icon, this.options.label));
            }
            if (typeof this.options.label === 'string') {
                dom.append(jQuery('<span>')
                    .addClass('menulabel')
                    .attr('title', this.options.label)
                    .text(this.options.label)
                    .get(0));
            }
            dom = dom.get(0);
        }
        return dom;
    }

    /**
     *
     *
     * @param {EditorView} editorView
     *
     * @return {void}
     */
    update(editorView) {
        if (typeof this.options.update === 'function') {
            this.options.update(editorView, this.dom);
        }

        if (this.isActive(editorView.state)) {
            this.dom.classList.add('is-active');
        } else {
            this.dom.classList.remove('is-active');
        }

        if (!this.options.command(editorView.state, null, editorView)) {
            this.dom.classList.add('is-disabled');
        } else {
            this.dom.classList.remove('is-disabled');
        }
    }

    /**
     * Add classes and title (if available) to the icon
     *
     * @param {HTMLSpanElement} icon <span>-element with the icon inside
     * @param {string} title Title to display
     * @return {HTMLSpanElement}
     */
    static renderSVGIcon(icon, title = '') {
        return jQuery(icon).addClass('menuicon').attr('title', title);
    }
}

export default MenuItem;
