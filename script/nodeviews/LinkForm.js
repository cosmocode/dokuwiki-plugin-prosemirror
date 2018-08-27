import CustomForm from './CustomForm';
import MediaForm from './MediaForm';

class LinkForm extends CustomForm {
    constructor() {
        super('prosemirror-linkform');

        this.name = LANG.plugins.prosemirror.linkConfig;

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
            let [shortcut, reference] = target.split('>', 2); // eslint-disable-line no-magic-numbers
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

        this.$form.find('.js-open-linkwiz').on('click', () => {
            window.dw_linkwiz.insertLink = this.insertLink.bind(this);
            window.dw_linkwiz.toggle();
        });

        this.resetForm();
    }

    /**
     * Function used by the linkwizard to insert the link into the linktarget input field
     */
    insertLink() {
        const link = window.dw_linkwiz.$entry.val();
        this.setLinkTarget(null, link);
        window.dw_linkwiz.toggle();
        window.dw_linkwiz.$entry.val(window.dw_linkwiz.$entry.val().replace(/[^:]*$/, ''));
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
        const $linkWizButton = this.$form.find('.js-open-linkwiz').hide();
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
            $linkWizButton.show();
            $linkTargetInput
                .attr('type', 'text')
                .prop('placeholder', LANG.plugins.prosemirror['placeholder:page']);
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
        return function resolveSubmittedLinkDataCallback(event) {
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
                const ajaxEndpoint = `${DOKU_BASE}lib/exe/ajax.php`;
                const ajaxParams = {
                    call: 'plugin_prosemirror',
                    actions,
                    inner: newAttrs['data-inner'],
                    id: JSINFO.id,
                    ...params,
                };
                jQuery.get(
                    ajaxEndpoint,
                    ajaxParams,
                ).done((data) => {
                    if (data.resolveInternalLink) {
                        const {
                            id, exists, heading: linkName,
                        } = data.resolveInternalLink;
                        newAttrs['data-resolvedID'] = id;
                        newAttrs['data-resolvedTitle'] = id;
                        newAttrs['data-resolvedClass'] = exists ? 'wikilink1' : 'wikilink2';
                        if (nameType === 'automatic') {
                            newAttrs['data-resolvedName'] = linkName;
                        }
                    }
                    if (data.resolveInterWikiLink) {
                        const {
                            url, resolvedClass,
                        } = data.resolveInterWikiLink;
                        newAttrs['data-resolvedUrl'] = url;
                        newAttrs['data-resolvedClass'] = resolvedClass;
                    }
                    if (data.resolveImageTitle) {
                        newAttrs['data-resolvedImage'] = data.resolveImageTitle['data-resolvedImage'];
                    }

                    callback(newAttrs);
                }).fail((jqXHR, textStatus, errorThrown) => {
                    let errorMsg = `There was an error resolving this link -- ${errorThrown}: ${textStatus}.`;
                    if (window.SentryPlugin) {
                        window.SentryPlugin.logSentryException(new Error('Ajax Request failed'), {
                            tags: {
                                plugin: 'prosemirror',
                                id: JSINFO.id,
                            },
                            extra: {
                                ajaxEndpoint,
                                ajaxParams,
                                textStatus,
                                errorThrown,
                            },
                        });
                        errorMsg += ' The error has been logged to Sentry.';
                    }
                    errorMsg += ' You may want to continue your work in the syntax editor.';
                    jQuery('#draft__status').after(jQuery('<div class="error"></div>').text(errorMsg));
                });

                return;
            }
            callback(newAttrs);
        };
    }
}

export default LinkForm;
