const { MenuItem } = require('./MenuItem');

class Dropdown extends MenuItem {
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

    showContent() {
        this.contentDom.style.display = 'block';
        jQuery(document).on(
            `mousedown.prosemirror${btoa(this.options.label)}`,
            this.closeOnNextClick.bind(this, Date.now()),
        );
    }

    closeOnNextClick(timeAttached) {
        const DELAY_TO_NEXT_CLICK = 10;
        const timePassedSinceAttached = Date.now() - timeAttached;

        if (timePassedSinceAttached < DELAY_TO_NEXT_CLICK) {
            return;
        }
        this.hideContent();
    }

    hideContent() {
        this.contentDom.style.display = 'none';
        jQuery(document).off(`mousedown.prosemirror${btoa(this.options.label)}`);
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

    isActive(state) {
        return this.content.some(item => item.isActive(state));
    }
}

exports.Dropdown = Dropdown;
