import NodeForm from './NodeForm.js';

class CustomForm extends NodeForm {
    /**
     * @param {string} formID id of the respective form element
     *
     * @return {void}
     */
    constructor(formID) {
        super();

        this.$form = jQuery(`#${formID}`);
        this.$form.find('[name="cancel-button"]').on('click', this.hide.bind(this));
    }

    /**
     * Bind the submit handler for the dialog that is about to be shown
     *
     * The form element is part of the page and shared by every instance of this form, so a
     * handler must not outlive its dialog. The handler replaces any previous one and is
     * removed on dialog close (OK, Cancel, the close button or Escape).
     *
     * @param {function} callback the submit handler
     *
     * @return {void}
     */
    bindSubmitUntilClose(callback) {
        this.$form.off('submit').on('submit', callback);
        this.$form.off('dialogclose.prosemirrorSubmit')
            .one('dialogclose.prosemirrorSubmit', () => this.$form.off('submit'));
    }
}

export default CustomForm;
