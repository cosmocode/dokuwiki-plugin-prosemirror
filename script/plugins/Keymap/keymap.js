import { keymap } from '../../../dist/prosemirror.js';
import { splitListItem, sinkListItem, liftListItem } from '../../../dist/prosemirror.js';
import { baseKeymap, chainCommands } from '../../../dist/prosemirror.js';
import { redo, undo } from '../../../dist/prosemirror.js';
import { insertHardBreak, enterInTableCell } from '../../customCommands.js';


function getKeymapPlugin(schema) {
    // Mac OS has its own typical shortcuts
    const isMac = typeof navigator !== 'undefined' ? /Mac/.test(navigator.platform) : false;

    const customKeymap = {};

    customKeymap.Enter = chainCommands(
        enterInTableCell(schema),
        splitListItem(schema.nodes.list_item), // eslint-disable-line import/no-named-as-default-member
    );

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

    // Where no line break is allowed (headings, code blocks), Shift+Enter does what Enter does.
    // Without a binding there, the browser would handle the key itself.
    const lineBreakKeymap = {
        'Shift-Enter': chainCommands(insertHardBreak(schema), combinedKeymapUnion.Enter),
    };

    const mergedKeymap = {
        ...baseKeymap,
        ...customKeymap,
        ...combinedKeymapUnion,
        ...historyKeymap,
        ...indentationKeymap,
        ...lineBreakKeymap,
    };

    return keymap(mergedKeymap);
}

export default getKeymapPlugin;
