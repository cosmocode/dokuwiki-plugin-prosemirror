import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema, Node } from 'prosemirror-model';

import { tableEditing } from 'prosemirror-tables';
import { history } from 'prosemirror-history';
import getSpec from './schema';
import getKeymapPlugin from './plugins/Keymap/keymap';
import buildInputRules from './plugins/InputRules/inputrules';
import initializePublicAPI from './initializePublicAPI';
import MenuInitializer from './plugins/Menu/MenuInitializer';
import getNodeViews from './nodeviews';
import { disableDefaultTabBehavior } from './plugins/disableDefaultTabBehavior';

initializePublicAPI();

window.Prosemirror.enableProsemirror = function enableProsemirror() {
    const schema = new Schema(getSpec());

    const mi = new MenuInitializer(schema);

    // PLUGIN ORDER IS IMPORTANT!
    const plugins = [
        mi.getMenuPlugin(),
        history(),
        getKeymapPlugin(schema),
        buildInputRules(schema),
        tableEditing(schema),
        disableDefaultTabBehavior(),
    ];

    const json = jQuery('#dw__editform').find('[name=prosemirror_json]').get(0);
    const view = new EditorView(document.querySelector('#prosemirror__editor'), {
        state: EditorState.create({
            doc: Node.fromJSON(schema, JSON.parse(json.value)),
            schema,
            plugins,
        }),
        dispatchTransaction(tr) {
            view.updateState(view.state.apply(tr));

            const spaces = 4;
            json.value = JSON.stringify(view.state.doc.toJSON(), null, spaces); // FIXME: no need to pretty print this!
        },
        nodeViews: getNodeViews(),
    });
    window.Prosemirror.view = view;
};

window.Prosemirror.destroyProsemirror = function destroyProsemirror() {
    if (window.Prosemirror.view && typeof window.Prosemirror.view.destroy === 'function') {
        window.Prosemirror.view.destroy();
    }
};
