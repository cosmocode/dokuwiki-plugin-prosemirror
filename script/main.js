const { EditorState } = require('prosemirror-state');
const { EditorView } = require('prosemirror-view');
const { Node } = require('prosemirror-model');
const { exampleSetup } = require('prosemirror-example-setup');
const { schema } = require('./schema');

console.log(schema);

// textarea holds our intial data and will be updated on editor changes
const json = document.getElementById('json');
const view = new EditorView(document.querySelector('#editor'), {
    state: EditorState.create({
        doc: Node.fromJSON(schema, JSON.parse(json.value)),
        schema,
        plugins: exampleSetup({ schema }),
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
