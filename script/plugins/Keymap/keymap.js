import { keymap } from '../../../vendor/prosemirror.js';
import { splitListItem, sinkListItem, liftListItem } from '../../../vendor/prosemirror.js';
import { baseKeymap, chainCommands } from '../../../vendor/prosemirror.js';
import { redo, undo } from '../../../vendor/prosemirror.js';


function getKeymapPlugin(schema) {
    // Mac OS has its own typical shortcuts
    const isMac = typeof navigator !== 'undefined' ? /Mac/.test(navigator.platform) : false;

    const customKeymap = {};

    customKeymap.Enter = splitListItem(schema.nodes.list_item); // eslint-disable-line import/no-named-as-default-member

    const combinedKeymapUnion = Object.keys(customKeymap).reduce((acc, key) => {
        if (baseKeymap[key]) {
            acc[key] = chainCommands(customKeymap[key], baseKeymap[key]);
        }
        return acc;
    }, {});

    const historyKeymap = { 'Mod-z': undo, 'Mod-Shift-z': redo };
    if (!isMac) {
        historyKeymap['Mod-y'] = redo;
    }

    const indentationKeymap = {
        Tab: sinkListItem(schema.nodes.list_item),
        'Shift-Tab': liftListItem(schema.nodes.list_item),
    };

    const mergedKeymap = {
        ...baseKeymap,
        ...customKeymap,
        ...combinedKeymapUnion,
        ...historyKeymap,
        ...indentationKeymap,
    };

    return keymap(mergedKeymap);
}

export default getKeymapPlugin;
