import { toggleMark } from 'prosemirror-commands';
import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher';
import MenuItem from '../MenuItem';
import { svgIcon } from '../MDI';

export default class MarkMenuItemDispatcher extends AbstractMenuItemDispatcher {
    constructor(markType, iconName, title) {
        super();

        this.markType = markType;
        this.iconName = iconName;
        this.title = title;
    }

    isAvailable(schema) {
        return !!schema.marks[this.markType];
    }

    /**
     * Determine if the mark is currently active at the cursor
     *
     * taken from prosemirror-example-setup
     *
     * @param {EditorState} state the editor's current state
     * @param {MarkType} type type of the mark based on the schema (e.g. schema.marks.strong )
     * @return {boolean} True if the mark is currently active
     */
    static markActive(state, type) {
        const {
            from, $from, to, empty,
        } = state.selection;
        if (empty) {
            return type.isInSet(state.storedMarks || $from.marks());
        }
        return state.doc.rangeHasMark(from, to, type);
    }

    getMenuItem(schema) {
        if (!this.isAvailable(schema)) {
            throw new Error(`Mark ${this.markType} is not available in Schema!`);
        }

        return new MenuItem({
            command: toggleMark(schema.marks[this.markType]),
            icon: svgIcon(this.iconName),
            label: this.title,
            isActive: editorState => MarkMenuItemDispatcher.markActive(editorState, schema.marks[this.markType]),
        });
    }
}
