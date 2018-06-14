import { keymap } from 'prosemirror-keymap';
import { splitListItem } from 'prosemirror-schema-list';
import schema from './schema';


const customKeymap = {};

customKeymap.Enter = splitListItem(schema.nodes.list_item);

const customKeymapPlugin = keymap(customKeymap);

// exports.customKeymapPlugin = customKeymapPlugin;

export default customKeymapPlugin;
