import { keymap } from 'prosemirror-keymap';
import { splitListItem, sinkListItem, liftListItem } from 'prosemirror-schema-list';
import {
    baseKeymap, chainCommands, exitCode, toggleMark,
} from 'prosemirror-commands';
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

    const formatKeymap = {
        'Mod-b': toggleMark(schema.marks.strong),
        'Mod-B': toggleMark(schema.marks.strong),
        'Mod-i': toggleMark(schema.marks.em),
        'Mod-I': toggleMark(schema.marks.em),
    };

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
        ...formatKeymap,
        ...historyKeymap,
        ...indentationKeymap,
    };

    return keymap(mergedKeymap);
}

export default getKeymapPlugin;
