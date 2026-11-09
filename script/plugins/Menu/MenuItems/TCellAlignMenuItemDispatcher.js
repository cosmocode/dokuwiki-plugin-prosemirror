import { isInTable, selectionCell, setCellAttr } from '../../../../vendor/prosemirror.js';
import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher.js';
import { svgIcon } from '../MDI.js';
import MenuItem from '../MenuItem.js';

/**
 * Get the table cell the selection is in
 *
 * prosemirror-tables' selectionCell() throws a RangeError outside of tables,
 * but the menu evaluates isActive() for every selection.
 *
 * @param {EditorState} state
 * @return {ResolvedPos|null} position directly before the cell, or null if not in a table
 */
function getSelectedCell(state) {
    return isInTable(state) ? selectionCell(state) : null;
}

export default class TCellAlignMenuItemDispatcher extends AbstractMenuItemDispatcher {
    constructor(align) {
        super();
        this.align = align;
    }

    isAvailable(schema) {
        return !!schema.nodes.table;
    }

    getMenuItem(schema) {
        if (!this.isAvailable(schema)) {
            throw new Error('Table not available in schema!');
        }

        return new MenuItem({
            command: (state, dispatch) => {
                const cell = getSelectedCell(state);
                if (!cell) {
                    return false;
                }
                if (cell.nodeAfter.attrs.align === this.align) {
                    return setCellAttr('align', '')(state, dispatch);
                }
                return setCellAttr('align', this.align)(state, dispatch);
            },
            icon: svgIcon(`format-align-${this.align}`),
            label: LANG.plugins.prosemirror[`label:table-cell-align-${this.align}`],
            isActive: (state) => {
                const cell = getSelectedCell(state);
                if (!cell) {
                    return false;
                }
                return cell.nodeAfter.attrs.align === this.align;
            },
        });
    }
}
