import KeyValueForm from './nodeviews/KeyValueForm';

export default function initializePublicAPI() {
    if (!window.Prosemirror.classes) {
        window.Prosemirror.classes = {};
    }
    window.Prosemirror.classes.KeyValueForm = KeyValueForm;
}
