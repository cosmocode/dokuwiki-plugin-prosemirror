import { mergeCells } from 'prosemirror-tables';
import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher';
import { svgIcon } from '../MDI';
import MenuItem from '../MenuItem';

export default class TCellMergeMenuItemDispatcher extends AbstractMenuItemDispatcher {
    static isAvailable(schema) {
        return !!schema.nodes.table;
    }

    static getMenuItem(schema) {
        if (!this.isAvailable(schema)) {
            throw new Error('Table not available in schema!');
        }

        return new MenuItem({
            command: mergeCells,
            icon: svgIcon('table-merge-cells'),
            label: LANG.plugins.prosemirror['label:table-cell-merge'],
        });
    }
}
