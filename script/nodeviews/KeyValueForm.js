import NodeForm from './NodeForm';

class KeyValueForm extends NodeForm {
    /**
     * Create a new key-value form
     *
     * The fields must generally at least contain a label key and a type key. Other attributes are usually added to the
     * created DOM node.
     *
     * @param {string} name The text in the form's title bar
     * @param {Object[]} fields the fields of the form
     */
    constructor(name, fields) {
        super();

        this.name = name;

        this.$form = jQuery('<form>').addClass('plugin_prosemirror_keyvalueform');
        KeyValueForm.buildForm(this.$form, fields);

        this.$form.append(jQuery('<button>', {
            type: 'submit',
        }).text('OK'));

        this.$form.find('[name="cancel-button"]').on('click', this.hide.bind(this));
    }

    static buildForm($form, fields) {
        const $fieldset = jQuery('<fieldset>').appendTo($form);
        fields.forEach((field) => {
            switch (field.type) {
            case 'textarea':
                KeyValueForm.addTextarea($fieldset, field);
                break;
            case 'select':
                KeyValueForm.addSelect($fieldset, field);
                break;
            default:
                KeyValueForm.addInput($fieldset, field);
            }
        });
    }

    /**
     * Add a select field with options to the $container
     *
     * The field must have at least an label key and an options key with an array of options attr objects.
     * All other attributes are added to the <select> node.
     * The objects in the options array should contain a label key, which will be the option's text, and other keys
     * which will become attributes to the respective <option> node.
     *
     * @param {jQuery} $container
     * @param {Object} field
     */
    static addSelect($container, field) {
        const {
            label, type: omitted, options, ...inputAttributes
        } = field;
        const $label = jQuery('<label>')
            .addClass('block')
            .append(jQuery('<span>').text(label));
        const $select = jQuery(
            '<select>',
            inputAttributes,
        );
        options.forEach((optionData) => {
            const { label: optionLabel, ...optionAttributes } = optionData;
            jQuery('<option>', optionAttributes).text(optionLabel).appendTo($select);
        });
        $label.append($select);
        $container.append($label);
    }

    /**
     * @param {jQuery} $container
     * @param {object} field expected to contain a label key and a value key, other keys are attributes
     */
    static addTextarea($container, field) {
        const {
            label, type: omitted, value, ...inputAttributes
        } = field;
        const $label = jQuery('<label>')
            .addClass('block')
            .append(jQuery('<span>').text(label));
        $label.append(jQuery(
            '<textarea>',
            inputAttributes,
        ).val(value));
        $container.append($label);
    }

    static addInput($container, field) {
        const { label, ...inputAttributes } = field;
        const $label = jQuery('<label>')
            .addClass('block')
            .append(jQuery('<span>').text(label));
        $label.append(jQuery(
            '<input>',
            inputAttributes,
        ).addClass('edit'));
        $container.append($label);
    }
}

export default KeyValueForm;
