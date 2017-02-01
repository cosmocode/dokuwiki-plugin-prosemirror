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

exports.schema = new Schema({
    nodes,
    marks
});
