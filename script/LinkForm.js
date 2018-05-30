const { NodeForm } = require('./NodeForm');
const { MediaForm } = require('./MediaForm');

class LinkForm extends NodeForm {
    constructor() {
        super('prosemirror-linkform');

        if (jQuery('#prosemirror-linkform').length) {
            this.initializeLinkForm();
            return;
        }

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

    setLinkNameType(type, data = '') {
        const availableTypes = this.$form.find('[name="nametype"]').map(function getValidValues() {
            return jQuery(this).val();
        }).get();
        if (!availableTypes.includes(type)) {
            console.error(`invalid link type ${type}. Only the following are valid: `, availableTypes);
            return;
        }

        this.$form.find(`[name="nametype"][value="${type}"]`).prop('checked', true).trigger('change');
        if (type === 'custom') {
            this.$form.find('[name="linkname"]').val(data);
        } else if (type === 'image') {
            this.MediaForm = new MediaForm('prosemirror-linkform');
            this.MediaForm.setSource(data.id);
            this.MediaForm.setCaption(data.title);
            this.MediaForm.setWidth(data.width);
            this.MediaForm.setHeight(data.height);
            this.MediaForm.setAlignment(data.align);
            this.MediaForm.setCache(data.cache);
        }
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
        this.$form.find('[name="nametype"]').on('change', this.handleNameTypeChange.bind(this));
        this.$form.find('[name="linktype"]').on('change', this.handleLinkTypeChange.bind(this));

        this.resetForm();
    }

    handleNameTypeChange() {
        const nametype = this.$form.find('[name="nametype"]:checked').val();
        switch (nametype) {
        case 'automatic':
            this.$form.find('.js-media-fieldset').remove();
            this.$form.find('[name="linkname"]').val('').attr('type', 'hidden').closest('label')
                .hide();
            break;
        case 'custom':
            this.$form.find('.js-media-fieldset').remove();
            this.$form.find('[name="linkname"]').val('').attr('type', 'text').closest('label')
                .show();
            break;
        case 'image': {
            this.$form.find('[name="linkname"]').val('').attr('type', 'hidden').closest('label')
                .hide();
            const $imageFields = jQuery('#prosemirror-mediaform').find('.js-media-fieldset').clone();
            this.$form.find('.js-media-wrapper').html($imageFields);
            this.MediaForm = new MediaForm('prosemirror-linkform');
            break;
        }
        default:
            console.log(nametype);
        }
    }

    handleLinkTypeChange() {
        const linktype = this.$form.find('[name="linktype"]:checked').val();
        const $linkTargetInput = this.$form.find('[name="linktarget"]');
        this.$form.find('[name="iwshortcut"]').closest('label').hide();
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
            this.$form.find('[name="iwshortcut"]').closest('label').show();
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
    }

    static resolveSubmittedLinkData(linkForm, initialAttributes, callback) {
        return function (event) {
            event.preventDefault();
            event.stopPropagation();

            let newAttrs = initialAttributes;
            newAttrs['data-inner'] = linkForm.getLinkTarget();
            newAttrs['data-type'] = linkForm.getLinkType();
            const nameType = linkForm.getLinkNameType();
            if (nameType === 'custom') {
                newAttrs['data-name'] = linkForm.getLinkName();
            }
            if (nameType === 'automatic') {
                delete newAttrs['data-name'];
            }
            const actions = [];
            const params = {};
            const image = {};
            if (nameType === 'image') {
                delete newAttrs['data-name'];
                actions.push('resolveImageTitle');
                // image caption?
                image.id = linkForm.MediaForm.getSource();
                image.title = linkForm.MediaForm.getCaption();
                image.width = linkForm.MediaForm.getWidth();
                image.height = linkForm.MediaForm.getHeight();
                image.align = linkForm.MediaForm.getAlignment();
                image.cache = linkForm.MediaForm.getCache();
                params.image = image;
                newAttrs = Object.entries(image)
                    .reduce((carry, [key, value]) => ({ ...carry, [`image-${key}`]: value }), newAttrs);
            }

            if (newAttrs['data-type'] === 'internallink') {
                actions.push('resolveInternalLink');
            }

            if (newAttrs['data-type'] === 'interwikilink') {
                actions.push('resolveInterWikiLink');
            }

            if (actions.length) {
                jQuery.get(
                    `${DOKU_BASE}/lib/exe/ajax.php`,
                    {
                        call: 'plugin_prosemirror',
                        actions,
                        inner: newAttrs['data-inner'],
                        id: JSINFO.id,
                        ...params,
                    },
                ).done((data) => {
                    // FIXME handle aggregated data
                    const parsedData = JSON.parse(data);
                    if (parsedData.resolveInternalLink) {
                        const {
                            id, exists, heading: linkName,
                        } = parsedData.resolveInternalLink;
                        newAttrs['data-resolvedID'] = id;
                        newAttrs['data-resolvedTitle'] = id;
                        newAttrs['data-resolvedClass'] = exists ? 'wikilink1' : 'wikilink2';
                        if (nameType === 'automatic') {
                            newAttrs['data-resolvedName'] = linkName;
                        }
                    }
                    if (parsedData.resolveInterWikiLink) {
                        const {
                            url, resolvedClass,
                        } = parsedData.resolveInterWikiLink;
                        newAttrs['data-resolvedUrl'] = url;
                        newAttrs['data-resolvedClass'] = resolvedClass;
                    }
                    if (parsedData.resolveImageTitle) {
                        newAttrs['data-resolvedImage'] = parsedData.resolveImageTitle['data-resolvedImage'];
                    }

                    callback(newAttrs);
                });

                return;
            }
            callback(newAttrs);
        };
    }
}

exports.LinkForm = LinkForm;
