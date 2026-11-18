import { CellSelection, TextSelection } from '../../../../dist/prosemirror.js';
import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher.js';
import { svgIcon } from '../MDI.js';
import MenuItem from '../MenuItem.js';

/**
 * DokuWiki only knows a horizontal rule at the top level of a page, so the command is limited to
 * selections inside a top-level paragraph.
 */
export default class HruleMenuItemDispatcher extends AbstractMenuItemDispatcher {
    static isAvailable(schema) {
        return !!schema.nodes.horizontal_rule;
    }

    static getMenuItem(schema) {
        if (!this.isAvailable(schema)) {
            throw new Error('Horizontal rule not available in schema!');
        }
        const hrType = schema.nodes.horizontal_rule;

        return new MenuItem({
            command: (state, dispatch) => {
                const { selection } = state;
                if (selection instanceof CellSelection) return false;
                const { $from } = selection;
                if ($from.depth < 1 || $from.parent.type.spec.code) return false;
                if ($from.node(1).type !== schema.nodes.paragraph) return false;

                if (dispatch) {
                    const hr = hrType.create();
                    const tr = state.tr.replaceSelectionWith(hr);

                    // the position right after the new hr; tr.selection doesn't give it, because
                    // when another hr follows, the selection lands after that one instead
                    let after = 0;
                    tr.doc.forEach((node, offset) => {
                        if (node === hr) after = offset + node.nodeSize;
                    });
                    const next = tr.doc.resolve(after).nodeAfter;
                    if (!next || !next.isTextblock) {
                        tr.insert(after, schema.nodes.paragraph.create());
                    }
                    tr.setSelection(TextSelection.near(tr.doc.resolve(after), 1));
                    dispatch(tr.scrollIntoView());
                }
                return true;
            },
            icon: svgIcon('minus'),
            label: LANG.plugins.prosemirror['label:hrule'],
        });
    }
}
