import { selectionCell, setCellAttr } from 'prosemirror-tables';
import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher';
import { svgIcon } from '../MDI';
import MenuItem from '../MenuItem';

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
                const cell = selectionCell(state);
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
                const cell = selectionCell(state);
                if (!cell) {
                    return false;
                }
                return cell.nodeAfter.attrs.align === this.align;
            },
        });
    }
}
