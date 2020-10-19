import { keymap } from 'prosemirror-keymap';
import { splitListItem } from 'prosemirror-schema-list';
import { baseKeymap, chainCommands, newlineInCode } from 'prosemirror-commands';
import { redo, undo } from 'prosemirror-history';

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
	
    const newLineInCodeblock = { 'Shift-Enter': chainCommands(newlineInCode) };
	
    const mergedKeymap = {
        ...baseKeymap,
        ...customKeymap,
        ...combinedKeymapUnion,
        ...historyKeymap,
        ...newLineInCodeblock,
    };

    return keymap(mergedKeymap);
}

export default getKeymapPlugin;
