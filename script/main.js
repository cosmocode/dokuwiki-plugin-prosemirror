import { baseKeymap } from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Node } from 'prosemirror-model';

import schema from './schema';
import menu from './plugins/Menu/menu';
import customKeymapPlugin from './keymap';
import LinkView from './nodeviews/LinkView';
import MediaView from './nodeviews/MediaView';
import PluginInlineView from './nodeviews/PluginInlineView';
import CodeView from './nodeviews/CodeView';

// PLUGIN ORDER IS IMPORTANT!
const plugins = [
    menu,
    customKeymapPlugin,
    keymap(baseKeymap),
];

// textarea holds our intial data and will be updated on editor changes
const json = document.getElementById('prosemirror_json');
const view = new EditorView(document.querySelector('#prosemirror__editor'), {
    state: EditorState.create({
        doc: Node.fromJSON(schema, JSON.parse(json.value)),
        schema,
        plugins,
    }),
    dispatchTransaction(tr) {
        console.log('run');

        view.updateState(view.state.apply(tr));

        // current state as json in text area
        const spaces = 4;
        json.value = JSON.stringify(view.state.doc.toJSON(), null, spaces);
    },
    nodeViews: {
        link(node, outerview, getPos) {
            return new LinkView(node, outerview, getPos);
        },
        image(node, outerview, getPos) {
            return new MediaView(node, outerview, getPos);
        },
        dwplugin_inline(node, outerview, getPos) {
            return new PluginInlineView(node, outerview, getPos);
        },
        code_block(node, outerview, getPos) {
            return new CodeView(node, outerview, getPos);
        },
    },
});
window.view = view.editor;

jQuery(window).on('scroll', () => {
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
