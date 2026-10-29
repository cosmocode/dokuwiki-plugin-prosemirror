import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher.js';
import { svgIcon } from '../MDI.js';
import MenuItem from '../MenuItem.js';
import { setBlockTypeNoAttrCheck } from '../../../customCommands.js';

export default class TableMenuItemDispatcher extends AbstractMenuItemDispatcher {
    static isAvailable(schema) {
        return !!schema.nodes.table;
    }

    static getMenuItem(schema) {
        if (!this.isAvailable(schema)) {
            throw new Error('Table not available in schema!');
        }
        return new MenuItem({
            command: (state, dispatch) => {
                if (!setBlockTypeNoAttrCheck(schema.nodes.table)(state)) {
                    return false;
                }
                if (dispatch) {
                    const tableCell = schema.nodes.table_cell.create({}, schema.nodes.paragraph.create());
                    const rowCells = [tableCell, tableCell.copy(tableCell.content)];
                    const tableRow = schema.nodes.table_row.create({}, rowCells);
                    const tableRows = [tableRow, tableRow.copy(tableRow.content)];
                    const tableNode = schema.nodes.table.create({}, tableRows);
                    dispatch(state.tr.replaceSelectionWith(tableNode));
                }

                return true;
            },
            icon: svgIcon('table-plus'),
            label: LANG.plugins.prosemirror['label:table'],
        });
    }
}
