const {EditorState} = require("prosemirror-state");
const {MenuBarEditorView} = require("prosemirror-menu");
const {Node} = require("prosemirror-model");
const {exampleSetup} = require("prosemirror-example-setup");

const {schema} = require("./schema");

// textarea holds our intial data and will be updated on editor changes
const json = document.getElementById('json');

let view = new MenuBarEditorView(document.querySelector("#editor"), {
    state: EditorState.create({
        doc: Node.fromJSON(schema, JSON.parse(json.value)),
        schema: schema,
        plugins: exampleSetup({schema})
    }),
    onAction(action) {
        view.updateState(view.editor.state.applyAction(action));

        //current state as json in text area
        json.value =  JSON.stringify(view.editor.state.doc.toJSON(), null, 4);
    }
});
window.view = view.editor;


