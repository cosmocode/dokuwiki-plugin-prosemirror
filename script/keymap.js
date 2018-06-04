const { splitListItem } = require('prosemirror-schema-list');
const { keymap } = require('prosemirror-keymap');
const { schema } = require('./schema');


const customKeymap = {};

customKeymap.Enter = splitListItem(schema.nodes.list_item);

const customKeymapPlugin = keymap(customKeymap);

exports.customKeymapPlugin = customKeymapPlugin;
