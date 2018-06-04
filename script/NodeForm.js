class NodeForm {
    constructor(formID) {
        this.$form = jQuery(`#${formID}`);
    }

    show() {
        jQuery(this.$form).dialog({
            title: this.name,
            width: 600,
        });
    }

    hide() {
        jQuery(this.$form).dialog('close');
    }

    on(eventName, callback) {
        this.$form.on(eventName, callback);
    }

    off(eventName) {
        this.$form.off(eventName);
    }
}

exports.NodeForm = NodeForm;
