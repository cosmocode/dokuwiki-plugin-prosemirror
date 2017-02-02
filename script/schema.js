/**
 * Defines a custom Schema for DokuWiki
 *
 * extends the basic schemas provided by ProseMirror
 */

// load default schema definitions
const {Schema} = require("prosemirror-model");
const {nodes, marks} = require("prosemirror-schema-basic");
const {bulletList, orderedList, listItem} = require("prosemirror-schema-list");

// heading shall only contain unmarked text
nodes.heading.content = 'text*';

nodes.doc.content = '(block | listblock)+';

nodes.ordered_list = orderedList;
nodes.ordered_list.group = 'listblock';
nodes.ordered_list.content = 'listitem+';

nodes.bullet_list = bulletList;
nodes.bullet_list.group = 'listblock';
nodes.bullet_list.content = 'listitem+';

nodes.list_item = listItem;
nodes.list_item.group = 'listitem';
nodes.list_item.content = '(paragraph | listblock)';

exports.schema = new Schema({
    nodes,
    marks
});
