import { keymap } from 'prosemirror-keymap';
import { splitListItem, sinkListItem, liftListItem } from 'prosemirror-schema-list';
import { baseKeymap, chainCommands, exitCode } from 'prosemirror-commands';
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

    const indentationKeymap = {
        Tab: sinkListItem(schema.nodes.list_item),
        'Shift-Tab': liftListItem(schema.nodes.list_item),
    };

    const br = schema.nodes.hard_break;
    const cmd = chainCommands(exitCode, (state, dispatch) => {
        if (dispatch) dispatch(state.tr.replaceSelectionWith(br.create()).scrollIntoView());
        return true;
    });

    const hardBreakKeymap = {
        'Mod-Enter': cmd,
        'Shift-Enter': cmd,
    };

    if (isMac) {
        hardBreakKeymap['Ctrl-Enter'] = cmd;
    }

    const mergedKeymap = {
        ...baseKeymap,
        ...customKeymap,
        ...combinedKeymapUnion,
        ...historyKeymap,
        ...indentationKeymap,
        ...hardBreakKeymap,
    };

    return keymap(mergedKeymap);
}

export default getKeymapPlugin;
