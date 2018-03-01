const { NodeForm } = require('./NodeForm');

class LinkForm extends NodeForm {
    constructor() {
        super('prosemirror-linkform');
        jQuery(this.initializeLinkForm.bind(this));
    }

    getLinkType() {
        return this.$form.find('[name="linktype"]:checked').val();
    }

    setLinkType(type) {
        const availableTypes = this.$form.find('[name="linktype"]').map(function getValidValues() {
            return jQuery(this).val();
        }).get();
        if (!availableTypes.includes(type)) {
            console.error(`invalid link type ${type}. Only the following are valid: `, availableTypes);
            return;
        }
        this.$form.find(`[name="linktype"][value="${type}"]`).prop('checked', true).trigger('change');
    }

    getLinkTarget() {
        if (this.getLinkType() === 'interwikilink') {
            const shortcut = this.$form.find('[name="iwshortcut"]').val();
            const reference = this.$form.find('[name="linktarget"]').val();
            return `${shortcut}>${reference}`;
        }
        return this.$form.find('[name="linktarget"]').val();
    }

    setLinkTarget(type, target) {
        if (type === 'interwikilink') {
            let [shortcut, reference] = target.split('>', 2);
            if (!reference) {
                reference = shortcut;
                shortcut = 'go';
            }
            this.$form.find('[name="iwshortcut"]').show().val(shortcut);
            this.$form.find('[name="linktarget"]').val(reference);
            return;
        }
        this.$form.find('[name="linktarget"]').val(target);
    }

    getLinkNameType() {
        return this.$form.find('[name="nametype"]:checked').val();
    }

    setLinkNameType(type, name = '') {
        const availableTypes = this.$form.find('[name="nametype"]').map(function getValidValues() {
            return jQuery(this).val();
        }).get();
        if (!availableTypes.includes(type)) {
            console.error(`invalid link type ${type}. Only the following are valid: `, availableTypes);
            return;
        }

        this.$form.find(`[name="nametype"][value="${type}"]`).prop('checked', true).trigger('change');
        this.$form.find('[name="linkname"]').val(name);
    }

    getLinkName() {
        return this.$form.find('[name="linkname"]').val();
    }

    resetForm() {
        this.setLinkTarget('');
        this.setLinkType('externallink');
        this.setLinkNameType('automatic');
        this.off();
    }

    initializeLinkForm() {
        this.$form.find('[name="nametype"]').on('change', () => {
            const nametype = this.$form.find('[name="nametype"]:checked').val();
            switch (nametype) {
            case 'automatic':
                this.$form.find('[name="linkname"]').val('').attr('type', 'hidden').closest('label')
                    .hide();
                break;
            case 'custom':
                this.$form.find('[name="linkname"]').val('').attr('type', 'text').closest('label')
                    .show();
                break;
            default:
                console.log(nametype);
            }
        });

        this.$form.find('[name="linktype"]').on('change', () => {
            const linktype = this.$form.find('[name="linktype"]:checked').val();
            const $linkTargetInput = this.$form.find('[name="linktarget"]');
            this.$form.find('[name="iwshortcut"]').hide();
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
                this.$form.find('[name="iwshortcut"]').show();
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
