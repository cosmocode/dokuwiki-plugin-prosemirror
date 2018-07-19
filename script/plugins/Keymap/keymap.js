import { keymap } from 'prosemirror-keymap';
import { splitListItem } from 'prosemirror-schema-list';
import { baseKeymap, chainCommands } from 'prosemirror-commands';

function getKeymapPlugin(schema) {
    const customKeymap = {};

    customKeymap.Enter = splitListItem(schema.nodes.list_item); // eslint-disable-line import/no-named-as-default-member

    const combinedKeymapUnion = Object.keys(customKeymap).reduce((acc, key) => {
        if (baseKeymap[key]) {
            acc[key] = chainCommands(customKeymap[key], baseKeymap[key]);
        }
        return acc;
    }, {});

    const mergedKeymap = {
        ...baseKeymap,
        ...customKeymap,
        ...combinedKeymapUnion,
    };

    return keymap(mergedKeymap);
}

export default getKeymapPlugin;
