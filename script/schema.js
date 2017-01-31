/**
 * Defines a custom Schema for DokuWiki
 *
 * extends the basic schemas provided by ProseMirror
 */

// load default schema definitions
const {Schema} = require("prosemirror-model");
const {nodes, marks} = require("prosemirror-schema-basic");
//const {addListNodes} = require("prosemirror-schema-list");

// heading shall only contain unmarked text
nodes.heading.content = 'text*';
nodes.heading.defining = false; // unsure if this does anything


exports.schema = new Schema({
    nodes: nodes,
    marks: marks
});
