const {EditorState} = require("prosemirror-state");
const {MenuBarEditorView} = require("prosemirror-menu");
const {DOMParser, Schema, Node} = require("prosemirror-model");
const {schema: baseSchema} = require("prosemirror-schema-basic");
const {addListNodes} = require("prosemirror-schema-list");
const {exampleSetup} = require("prosemirror-example-setup");

// default schema
const nodes = addListNodes(baseSchema.nodeSpec, "paragraph block*", "block");

// heading shall only contain unmarked text
const heading = nodes.get('heading');
heading.content = 'text*';
heading.defining = false; // unsure if this does anything


const schema = new Schema({
    nodes: nodes,
    marks: baseSchema.markSpec
});





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


