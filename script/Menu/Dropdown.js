const { MenuItem } = require('./MenuItem');

class Dropdown extends MenuItem {
    constructor(content, options) {
        super({
            command: () => true,
            render: view => this.renderIcon(view, options),
        });
        this.content = Array.isArray(content) ? content : [content];
    }

    renderIcon(editorView, options) {
        const $menuItemContainer = jQuery('<span>').addClass('dropdown menuitem');
        const $dropdownLabel = jQuery('<span>').text(options.label).addClass('menulabel');
        $menuItemContainer.append($dropdownLabel);

        jQuery($dropdownLabel).on('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.open) {
                this.open = false;
                this.hideContent();
            } else {
                this.open = true;
                this.showContent();
            }
        });

        this.renderDropdownItems(editorView, $menuItemContainer);
        this.hideContent();

        return $menuItemContainer.get(0);
    }

    showContent() {
        // TODO: add listener to close it by clicking anywhere else
        this.contentDom.style.display = 'block';
    }

    hideContent() {
        this.contentDom.style.display = 'none';
    }


    renderDropdownItems(editorView, $menuItemContainer) {
        this.contentDom = document.createElement('div');
        this.contentDom.className = 'dropdown_content';
        this.content.forEach((item) => {
            const itemDom = item.render(editorView);
            this.contentDom.appendChild(itemDom);
        });
        $menuItemContainer.append(this.contentDom);
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
