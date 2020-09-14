import CustomForm from './CustomForm';

let mfInstance = null;

class MediaForm extends CustomForm {
    /**
     * @param {string} id ID of the form
     *
     */
    constructor(id = 'prosemirror-mediaform') {
        super(id);

        // prevent repeated initialization
        if (!mfInstance) {
            this.name = LANG.plugins.prosemirror.mediaConfig;
            this.$form.find('.js-open-mediamanager').on('click', MediaForm.openMediaManager);
            window.pmMediaSelect = this.mediaSelect.bind(this);
            mfInstance = this;
        }
    }

    /**
     * on click handler for the mediamanager button
     */
    static openMediaManager() {
        window.open(
            `${DOKU_BASE}lib/exe/mediamanager.php?ns=${encodeURIComponent(JSINFO.namespace)}&onselect=pmMediaSelect`,
            'mediaselect',
            'width=750,height=500,left=20,top=20,scrollbars=yes,resizable=yes',
        );
    }

    /**
     * Callback for the media manager
     *
     * @param edid ignored
     * @param {string} mediaid id of the media file
     * @param {string} opts query string the may contain linking param and width in px
     * @param {string} align the alignment specified as number
     */
    mediaSelect(edid, mediaid, opts, align) {
        this.setSource(mediaid);

        // there are no options when media is not an image, nothing to set
        if (!opts) {
            return;
        }

        const [, linking, width] = /\?([a-z]+)?&?(\d+)?/.exec(opts);
        this.setWidth(width);
        this.setHeight();
        this.setLinking(linking);
        const alignValue = {
            1: '',
            2: 'left',
            3: 'center',
            4: 'right',
        };
        this.setAlignment(alignValue[align]);
    }

    /**
     * Set either the source of the image
     *
     * @param {string} id DokuWiki id of the image or external address
     *
     * @return {void}
     */
    setSource(id = '') {
        this.$form.find('[name="mediatarget"]').val(id);
    }

    getSource() {
        return this.$form.find('[name="mediatarget"]').val();
    }

    setCaption(caption = '') {
        this.$form.find('[name="mediacaption"]').val(caption);
    }

    getCaption() {
        return this.$form.find('[name="mediacaption"]').val();
    }

    setWidth(width = '') {
        this.$form.find('[name="width"]').val(width);
    }

    getWidth() {
        return this.$form.find('[name="width"]').val();
    }

    setHeight(height = '') {
        this.$form.find('[name="height"]').val(height);
    }

    getHeight() {
        return this.$form.find('[name="height"]').val();
    }

    setAlignment(alignment = '') {
        this.$form.find('[name="alignment"]').prop('checked', '');
        this.$form.find(`[name="alignment"][value="${alignment}"]`).prop('checked', 'checked');
    }

    getAlignment() {
        return this.$form.find('[name="alignment"]:checked').val();
    }

    setLinking(linking = 'details') {
        this.$form.find('[name="linking"]').prop('checked', '');
        this.$form.find(`[name="linking"][value="${linking}"]`).prop('checked', 'checked');
    }

    getLinking() {
        return this.$form.find('[name="linking"]:checked').val();
    }

    setCache(cache = '') {
        this.$form.find('[name="caching"]').prop('checked', '');
        this.$form.find(`[name="caching"][value="${cache}"]`).prop('checked', 'checked');
    }

    getCache() {
        return this.$form.find('[name="caching"]:checked').val();
    }

    resetForm() {
        this.setSource();
        this.setCaption();
        this.setWidth();
        this.setHeight();
        this.setAlignment();
        this.setLinking();
        this.setCache();
    }

    static resolveSubmittedLinkData(initialAttrs, $mediaForm, callback) {
        return (event) => {
            event.preventDefault();
            const newAttrs = { ...initialAttrs };
            newAttrs.id = $mediaForm.getSource();
            newAttrs.title = $mediaForm.getCaption();
            newAttrs.width = $mediaForm.getWidth();
            newAttrs.height = $mediaForm.getHeight();
            newAttrs.align = $mediaForm.getAlignment();
            newAttrs.linking = $mediaForm.getLinking();
            newAttrs.cache = $mediaForm.getCache();

            this.resolveImageAttributes(newAttrs, callback);
        };
    }

    static resolveImageAttributes(newAttrs, callback) {
        const ajaxEndpoint = `${DOKU_BASE}lib/exe/ajax.php`;
        const ajaxParams = {
            call: 'plugin_prosemirror',
            actions: ['resolveMedia'],
            attrs: newAttrs,
            id: JSINFO.id,
        };

        jQuery.get(
            ajaxEndpoint,
            ajaxParams,
        ).done((data) => {
            const resolvedAttrs = {
                ...newAttrs,
                'data-resolvedHtml': data.resolveMedia['data-resolvedHtml'],
            };
            callback(resolvedAttrs);
        }).fail((jqXHR, textStatus, errorThrown) => {
            let errorMsg = `There was an error resolving this image -- ${errorThrown}: ${textStatus}.`;
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
    }
}

export default MediaForm;
