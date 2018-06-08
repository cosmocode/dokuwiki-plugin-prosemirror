const { NodeForm } = require('./NodeForm');

class MediaForm extends NodeForm {
    constructor(id = 'prosemirror-mediaform') {
        super(id);

        this.name = 'Image Configuration';

        this.$form.find('.js-open-mediamanager').on('click', MediaForm.openMediaManager);
        window.pmMediaSelect = this.mediaSelect.bind(this);
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

            jQuery.get(
                `${DOKU_BASE}/lib/exe/ajax.php`,
                {
                    call: 'plugin_prosemirror',
                    actions: ['resolveMedia'],
                    attrs: newAttrs,
                    id: JSINFO.id,
                },
            ).done((data) => {
                const parsedData = JSON.parse(data);
                newAttrs['data-resolvedHtml'] = parsedData.resolveMedia['data-resolvedHtml'];
                console.log(newAttrs);
                callback(newAttrs);
            });
        };
    }
}
exports.MediaForm = MediaForm;
