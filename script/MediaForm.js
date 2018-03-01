const { NodeForm } = require('./NodeForm');

class MediaForm extends NodeForm {
    constructor() {
        super('prosemirror-mediaform');
        // jQuery(this.initialize.bind(this));
    }

    setSource(id) {
        this.$form.find('[name="mediatarget"]').val(id);
    }

    getSource() {
        return this.$form.find('[name="mediatarget"]').val();
    }

    setCaption(caption) {
        this.$form.find('[name="mediacaption"]').val(caption);
    }

    getCaption() {
        return this.$form.find('[name="mediacaption"]').val();
    }

    setWidth(width) {
        this.$form.find('[name="width"]').val(width);
    }

    getWidth() {
        return this.$form.find('[name="width"]').val();
    }

    setHeight(height) {
        this.$form.find('[name="height"]').val(height);
    }

    getHeight() {
        return this.$form.find('[name="height"]').val();
    }

    setAlignment(alignment) {
        this.$form.find('[name="alignment"]').prop('checked', '');
        this.$form.find(`[name="alignment"][value="${alignment}"]`).prop('checked', 'checked');
    }

    getAlignment() {
        return this.$form.find('[name="alignment"]:checked').val();
    }

    setLinking(linktype) {
        this.$form.find('[name="linktype"]').prop('checked', '');
        this.$form.find(`[name="linktype"][value="${linktype}"]`).prop('checked', 'checked');
    }

    getLinking() {
        return this.$form.find('[name="linktype"]:checked').val();
    }

    setCache(cache) {
        this.$form.find('[name="caching"]').prop('checked', '');
        this.$form.find(`[name="caching"][value="${cache}"]`).prop('checked', 'checked');
    }

    getCache() {
        return this.$form.find('[name="caching"]:checked').val();
    }

    // initialize() {
    //
    // }
}
exports.MediaForm = MediaForm;
