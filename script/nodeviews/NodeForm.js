class NodeForm {
    /**
     * Show this form in a jQueryUI dialog
     *
     * @return {void}
     */
    show() {
        this.hasBeenOpened = true;
        this.$form.dialog({
            title: this.name,
            width: 800,
            appendTo: '.dokuwiki',
        });
    }

    /**
     * Hide this form/dialog
     *
     * @return {void}
     */
    hide() {
        if (this.hasBeenOpened) {
            this.$form.dialog('close');
        }
    }

    /**
     * Bind a callback to an event on the form
     *
     * @param {string} eventName name of the event, can contain namespaces (e.g. click.myPlugin )
     * @param {function} callback the handler function to be attached to the event
     *
     * @return {void}
     */
    on(eventName, callback) {
        this.$form.on(eventName, callback);
    }

    /**
     * Remove a handler from an event
     *
     * @param {string} eventName name of the event, can contain namespaces (e.g. click.myPlugin )
     *
     * @return {void}
     */
    off(eventName) {
        this.$form.off(eventName);
    }

    destroy() {
        this.$form.remove();
    }
}

export default NodeForm;
