const {EditorState} = require("prosemirror-state");
const {MenuBarEditorView} = require("prosemirror-menu");
const {DOMParser, Schema} = require("prosemirror-model");
const {schema: baseSchema} = require("prosemirror-schema-basic");
const {addListNodes} = require("prosemirror-schema-list");
const {exampleSetup} = require("prosemirror-example-setup");

const schema = new Schema({
    nodes: addListNodes(baseSchema.nodeSpec, "paragraph block*", "block"),
    marks: baseSchema.markSpec
});



let view = new MenuBarEditorView(document.querySelector("#editor"), {
    state: EditorState.create({
        schema: schema,
        plugins: exampleSetup({schema})
    }),
    onAction(action) {

        view.updateState(view.editor.state.applyAction(action));
        document.getElementById('json').value =  JSON.stringify(view.editor.state.doc.toJSON());

    }
});
window.view = view.editor;
