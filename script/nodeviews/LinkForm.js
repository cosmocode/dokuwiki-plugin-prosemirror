import CustomForm from './CustomForm';
import MediaForm from './MediaForm';

class LinkForm extends CustomForm {
    constructor() {
        super('prosemirror-linkform');

        // prevent repeated initialization
        if (!LinkForm.instance) {
            this.name = LANG.plugins.prosemirror.linkConfig;

            if (jQuery('#prosemirror-linkform').length) {
                this.initializeLinkForm();
                LinkForm.instance = this;
                return LinkForm.instance;
            }

            jQuery(this.initializeLinkForm.bind(this));
        }
    }

    static getInstance() {
        if (!LinkForm.instance) {
            LinkForm.instance = new LinkForm();
        }
        return LinkForm.instance;
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

        this.$form.find('.js-open-linkwiz').on('click', this.toggleLinkWizard.bind(this));
        this.hookLinkWizard();

        this.resetForm();
    }

    /**
     * Pass our insertLink() to DokuWiki's link wizard but leave the original, so that the syntax editor can use it.
     *
     * @return {void}
     */
    hookLinkWizard() {
        const wiz = window.dw_linkwiz;
        if (!wiz || wiz.pmInsertLinkHooked) {
            return;
        }
        const coreInsertLink = wiz.insertLink;
        wiz.insertLink = (title) => {
            // if this link form has been initialized and is currently open
            if (this.hasBeenOpened && this.$form.dialog('isOpen')) {
                this.insertLink();
                return;
            }
            coreInsertLink.call(wiz, title);
        };
        wiz.pmInsertLinkHooked = true;
    }

    /**
     * Show or hide DokuWiki's link wizard using our functions.
     * As of Mort, we can no longer simply rely on toggle(), because now #link__wiz is in #tool__bar,
     * which we hide.
     *
     * @return {void}
     */
    toggleLinkWizard() {
        if (window.dw_linkwiz.$wiz.css('display') === 'none') {
            this.openLinkWizard();
        } else {
            this.closeLinkWizard();
        }
    }

    /**
     * Move the link wizard out of hidden container and position it.
     * Keep track of the original parent and CSS properties so we can restore them when closing the wizard.
     *
     * @return {void}
     */
    openLinkWizard() {
        const wiz = window.dw_linkwiz;
        if (!this.$linkWizardHome) {
            this.$linkWizardHome = wiz.$wiz.parent();
            this.linkWizardCss = {
                top: wiz.$wiz[0].style.top,
                left: wiz.$wiz[0].style.left,
            };
        }
        wiz.$wiz.appendTo(jQuery('.dokuwiki').first());

        wiz.show();
        wiz.$wiz.position({
            my: 'right top',
            at: 'right bottom+4',
            of: this.$form.find('.js-open-linkwiz'),
            collision: 'flipfit',
        });

        // clean up when dialog is closed while the wizard is still open
        this.$form.off('dialogclose.prosemirrorLinkwiz')
            .one('dialogclose.prosemirrorLinkwiz', this.closeLinkWizard.bind(this));
    }

    /**
     * Hide DokuWiki's link wizard and restore original DOM position and CSS properties
     *
     * @return {void}
     */
    closeLinkWizard() {
        const wiz = window.dw_linkwiz;
        if (!wiz || !wiz.$wiz) {
            return;
        }
        if (wiz.$wiz.css('display') !== 'none') {
            wiz.hide();
        }
        if (this.$linkWizardHome && this.$linkWizardHome.length) {
            wiz.$wiz.appendTo(this.$linkWizardHome);
        }
        if (this.linkWizardCss) {
            // an empty string removes the inline property again
            wiz.$wiz.css(this.linkWizardCss);
        }
        this.$linkWizardHome = null;
        this.linkWizardCss = null;
    }

    /**
     * Function used by the linkwizard to insert the link into the linktarget input field
     */
    insertLink() {
        const link = window.dw_linkwiz.$entry.val();
        this.setLinkTarget(null, link);
        this.closeLinkWizard();
        window.dw_linkwiz.$entry.val(link.replace(/[^:]*$/, ''));
        this.$form.find('[name="linktarget"]').trigger('focus');
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
