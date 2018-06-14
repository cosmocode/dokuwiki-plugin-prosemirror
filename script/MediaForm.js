import NodeForm from './NodeForm';

class MediaForm extends NodeForm {
    /**
     * @param {string} id ID of the form
     *
     * @return {void}
     */
    constructor(id = 'prosemirror-mediaform') {
        super(id);

        this.name = 'Image Configuration';
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
                const parsedData = JSON.parse(data);
                newAttrs['data-resolvedHtml'] = parsedData.resolveMedia['data-resolvedHtml'];
                console.log(newAttrs);
                callback(newAttrs);
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
        };
    }
}

export default MediaForm;
