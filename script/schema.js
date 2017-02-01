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

nodes.orderedList = bulletList;
nodes.orderedList.group = 'listblock';
nodes.orderedList.content = 'listitem';

nodes.bulletList = orderedList;
nodes.bulletList.group = 'listblock';
nodes.bulletList.content = 'listitem';

nodes.listItem = listItem;
nodes.listItem.group = 'listitem';
nodes.listItem.content = 'paragraph block* listblock'; // fixme we can not use text as a direct descendant because of improper inline/block mix

exports.schema = new Schema({
    nodes,
    marks
});
