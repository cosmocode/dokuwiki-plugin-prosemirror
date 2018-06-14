const { MenuItem } = require('./MenuItem');

class Dropdown extends MenuItem {
    /**
     * Create a new dropdown MenuItem
     *
     * @param {[MenuItem]} content Array of MenuItems to be displayed in the dropdown
     * @param {object}  options the command and render keys are overwritten, label key is required
     *
     * @returns {void}
     */
    constructor(content, options) {
        super({
            ...options,
            command: () => true,
            render: view => this.renderIcon(view, options),
        });
        this.content = Array.isArray(content) ? content : [content];
    }

    /**
     * Render the dropdown icon/label
     *
     * @param {EditorView} editorView the current editorView, passed down to rendering the items
     *
     * @return {HTMLElement} A span containing both the label and a hidden element with the items
     */
    renderIcon(editorView) {
        const $menuItemContainer = jQuery('<span>').addClass('dropdown menuitem');
        const $dropdownLabel = jQuery('<span>').text(this.options.label).addClass('menulabel');
        $menuItemContainer.append($dropdownLabel);

        jQuery($dropdownLabel).on('mousedown', (e) => {
            e.preventDefault();
            if (this.contentDom.style.display !== 'none') {
                this.hideContent();
            } else {
                this.showContent();
            }
        });

        this.renderContentDom(editorView, $menuItemContainer);
        $menuItemContainer.append(this.contentDom);
        this.hideContent();

        return $menuItemContainer.get(0);
    }

    /**
     * Render the items into the contentDom
     *
     * @param {EditorView} editorView the current editor view
     *
     * @return {void}
     */
    renderContentDom(editorView) {
        this.contentDom = document.createElement('div');
        this.contentDom.className = 'dropdown_content';
        this.content.forEach((item) => {
            const itemDom = item.render(editorView);
            this.contentDom.appendChild(itemDom);
        });
    }

    /**
     * Show the content and attach a event to close it on the next click
     *
     * @return {void}
     */
    showContent() {
        this.contentDom.style.display = 'block';
        jQuery(document).on(
            `mousedown.prosemirror${btoa(this.options.label)}`,
            this.closeOnNextClick.bind(this, Date.now()),
        );
    }

    /**
     * Close the dropdown on the next click, but prevent the current click form being counted twice
     *
     * @param {int} timeAttached the time when this event was attached
     *
     * @return {void}
     */
    closeOnNextClick(timeAttached) {
        const DELAY_TO_NEXT_CLICK = 10;
        const timePassedSinceAttached = Date.now() - timeAttached;

        if (timePassedSinceAttached < DELAY_TO_NEXT_CLICK) {
            return;
        }
        this.hideContent();
    }

    /**
     * Hide the dropdown
     *
     * @return {void}
     */
    hideContent() {
        this.contentDom.style.display = 'none';
        jQuery(document).off(`mousedown.prosemirror${btoa(this.options.label)}`);
    }

    /**
     * @param {EditorView} editorView the current editor view
     *
     * @return {void}
     */
    update(editorView) {
        this.content.forEach((item) => {
            item.update(editorView);
        });

        if (this.isActive(editorView.state)) {
            this.dom.classList.add('is-active');
        } else {
            this.dom.classList.remove('is-active');
        }

        const isAnyItemEnabled = this.content.some(item => item.options.command(editorView.state, null, editorView));
        this.dom.style.display = isAnyItemEnabled ? '' : 'none';
    }

    /**
     *
     * @param {EditorState} state The current EditorView.state
     *
     * @return {boolean} true if any of the DropDowns Items are in an active state, false otherwise
     */
    isActive(state) {
        return this.content.some(item => item.isActive(state));
    }
}

exports.Dropdown = Dropdown;
