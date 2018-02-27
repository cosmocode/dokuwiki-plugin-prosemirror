class LinkForm {
    constructor() {
        jQuery(this.initializeLinkForm.bind(this));
    }

    show() {
        this.$linkform.show();
    }

    hide() {
        this.$linkform.hide();
    }

    on(eventName, callback) {
        this.$linkform.on(eventName, callback);
    }

    off(eventName) {
        this.$linkform.off(eventName);
    }

    getLinkType() {
        return this.$linkform.find('[name="linktype"]:checked').val();
    }

    setLinkType(type) {
        const availableTypes = this.$linkform.find('[name="linktype"]').map(function getValidValues() {
            return jQuery(this).val();
        }).get();
        if (!availableTypes.includes(type)) {
            console.error(`invalid link type ${type}. Only the following are valid: `, availableTypes);
            return;
        }
        this.$linkform.find(`[name="linktype"][value="${type}"]`).prop('checked', true).trigger('change');
    }

    getLinkTarget() {
        if (this.getLinkType() === 'interwikilink') {
            const shortcut = this.$linkform.find('[name="iwshortcut"]').val();
            const reference = this.$linkform.find('[name="linktarget"]').val();
            return `${shortcut}>${reference}`;
        }
        return this.$linkform.find('[name="linktarget"]').val();
    }

    setLinkTarget(type, target) {
        if (type === 'interwikilink') {
            let [shortcut, reference] = target.split('>', 2);
            if (!reference) {
                reference = shortcut;
                shortcut = 'go';
            }
            this.$linkform.find('[name="iwshortcut"]').show().val(shortcut);
            this.$linkform.find('[name="linktarget"]').val(reference);
            return;
        }
        this.$linkform.find('[name="linktarget"]').val(target);
    }

    getLinkNameType() {
        return this.$linkform.find('[name="nametype"]:checked').val();
    }

    setLinkNameType(type, name = '') {
        const availableTypes = this.$linkform.find('[name="nametype"]').map(function getValidValues() {
            return jQuery(this).val();
        }).get();
        if (!availableTypes.includes(type)) {
            console.error(`invalid link type ${type}. Only the following are valid: `, availableTypes);
            return;
        }

        this.$linkform.find(`[name="nametype"][value="${type}"]`).prop('checked', true).trigger('change');
        this.$linkform.find('[name="linkname"]').val(name);
    }

    getLinkName() {
        return this.$linkform.find('[name="linkname"]').val();
    }

    resetForm() {
        this.setLinkTarget('');
        this.setLinkType('externallink');
        this.setLinkNameType('automatic');
        this.off();
    }

    initializeLinkForm() {
        const $linkform = jQuery('#prosemirror-linkform');
        this.$linkform = $linkform;
        $linkform.find('[name="nametype"]').on('change', () => {
            const nametype = $linkform.find('[name="nametype"]:checked').val();
            switch (nametype) {
            case 'automatic':
                $linkform.find('[name="linkname"]').val('').attr('type', 'hidden').closest('label')
                    .hide();
                break;
            case 'custom':
                $linkform.find('[name="linkname"]').val('').attr('type', 'text').closest('label')
                    .show();
                break;
            default:
                console.log(nametype);
            }
        });

        $linkform.find('[name="linktype"]').on('change', () => {
            const linktype = $linkform.find('[name="linktype"]:checked').val();
            const $linkTargetInput = $linkform.find('[name="linktarget"]');
            this.$linkform.find('[name="iwshortcut"]').hide();
            switch (linktype) {
            case 'externallink':
                $linkTargetInput
                    .attr('type', 'url')
                    .prop('placeholder', 'https://www.example.com');
                break;
            case 'emaillink':
                $linkTargetInput
                    .attr('type', 'email')
                    .prop('placeholder', 'mail@example.com');
                break;
            case 'internallink':
                $linkTargetInput
                    .attr('type', 'text')
                    .prop('placeholder', 'namespace:page');
                break;
            case 'interwikilink':
                this.$linkform.find('[name="iwshortcut"]').show();
                $linkTargetInput
                    .attr('type', 'text')
                    .prop('placeholder', '');
                break;
            case 'other':
                $linkTargetInput
                    .attr('type', 'text')
                    .prop('placeholder', '');
                break;
            default:
                console.warn(`unknown / unhandled linktype ${linktype}`);
            }
        });

        this.resetForm();
    }
}

exports.LinkForm = LinkForm;
