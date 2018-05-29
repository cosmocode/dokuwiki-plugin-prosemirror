class NodeForm {
    constructor(formID) {
        this.$form = jQuery(`#${formID}`);
    }

    show() {
        this.$form.show();
    }

    hide() {
        this.$form.hide();
    }

    on(eventName, callback) {
        this.$form.on(eventName, callback);
    }

    off(eventName) {
        this.$form.off(eventName);
    }
}

exports.NodeForm = NodeForm;
