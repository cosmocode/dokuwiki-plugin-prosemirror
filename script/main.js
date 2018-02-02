/* eslint-disable no-unused-vars */
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';

const { EditorState } = require('prosemirror-state');
const { EditorView } = require('prosemirror-view');
const { Node } = require('prosemirror-model');
const { schema } = require('./schema');

// textarea holds our intial data and will be updated on editor changes
const json = document.getElementById('prosemirror_json');
const view = new EditorView(document.querySelector('#prosemirror__editor'), {
    state: EditorState.create({
        doc: Node.fromJSON(schema, JSON.parse(json.value)),
        schema,
        plugins: [keymap(baseKeymap)],
    }),
    dispatchTransaction(tr) {
        console.log('run');

        view.updateState(view.state.apply(tr));

        // current state as json in text area
        const spaces = 4;
        json.value = JSON.stringify(view.state.doc.toJSON(), null, spaces);
    },

});
window.view = view.editor;
