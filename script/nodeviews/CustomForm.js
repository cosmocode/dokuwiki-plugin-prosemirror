import NodeForm from './NodeForm';

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
}

export default CustomForm;
