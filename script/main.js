import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema, Node } from 'prosemirror-model';

import { tableEditing } from 'prosemirror-tables';
import { history } from 'prosemirror-history';
import getSpec from './schema';
import getKeymapPlugin from './plugins/Keymap/keymap';
import initializePublicAPI from './initializePublicAPI';
import MenuInitializer from './plugins/Menu/MenuInitializer';
import getNodeViews from './nodeviews';

initializePublicAPI();

window.Prosemirror.enableProsemirror = function enableProsemirror() {
    const schema = new Schema(getSpec());

    const mi = new MenuInitializer(schema);

    // PLUGIN ORDER IS IMPORTANT!
    const plugins = [
        mi.getMenuPlugin(),
        history(),
        getKeymapPlugin(schema),
        tableEditing(schema),
    ];

    const json = jQuery('#dw__editform').find('[name=prosemirror_json]').get(0);
    const view = new EditorView(document.querySelector('#prosemirror__editor'), {
        state: EditorState.create({
            doc: Node.fromJSON(schema, JSON.parse(json.value)),
            schema,
            plugins,
        }),
        dispatchTransaction(tr) {
            console.log('run');

            view.updateState(view.state.apply(tr));

            const spaces = 4;
            json.value = JSON.stringify(view.state.doc.toJSON(), null, spaces); // FIXME: no need to pretty print this!
        },
        nodeViews: getNodeViews(),
    });
    window.view = view;
    jQuery(window).on('scroll.prosemirror_menu', () => {
        const $container = jQuery('#prosemirror__editor');
        const $menuBar = $container.find('.menubar');
        const docViewTop = jQuery(window).scrollTop();
        const containerTop = $container.offset().top;

        if (docViewTop > containerTop) {
            $menuBar.css('position', 'fixed');
        } else {
            $menuBar.css('position', '');
        }
    });
};

window.Prosemirror.destroyProsemirror = function destroyProsemirror() {
    if (window.view && typeof window.view.destroy === 'function') {
        window.view.destroy();
    }
    jQuery(window).off('scroll.prosemirror_menu');
};
