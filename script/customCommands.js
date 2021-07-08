import { Selection } from 'prosemirror-state';

/**
 * Returns a command that tries to set the selected textblocks to the given node type with the given attributes.
 *
 * Copied and adjusted from prosemirror-commands::setBlockType to not check for the node attributes
 */
export function setBlockTypeNoAttrCheck(nodeType, attrs) { // eslint-disable-line import/prefer-default-export
    return function setBlockTypeNoAttrCheckDispatch(state, dispatch) {
        const { from, to } = state.selection;
        let applicable = false;
        state.doc.nodesBetween(from, to, (node, pos) => {
            if (applicable) return false;
            if (!node.isTextblock || node.type === nodeType) return true;
            const $pos = state.doc.resolve(pos);
            const index = $pos.index();
            applicable = $pos.parent.canReplaceWith(index, index + 1, nodeType);
            return true;
        });
        if (!applicable) return false;
        if (dispatch) dispatch(state.tr.setBlockType(from, to, nodeType, attrs).scrollIntoView());
        return true;
    };
}

/**
 * Returns a command that inserts a new paragraph before or after the node at the given position
 *
 * @param {int}    pos       position near which the paragraph should be inserted
 * @param {string} direction should be 'before' or 'after'
 * @return {function}
 */
export function insertParagraphAtPos(pos, direction = 'after') {
    return function insertParagraphAtPosCommand(state, dispatch) {
        const $pos = state.doc.resolve(pos);
        const above = $pos.node(-1);
        const beforeOrAfter = direction !== 'after' ? $pos.index(-1) : $pos.indexAfter(-1);
        const type = above.contentMatchAt(beforeOrAfter).defaultType;

        if (!above.canReplaceWith(beforeOrAfter, beforeOrAfter, type)) {
            return false;
        }

        if (dispatch) {
            const insertPos = direction !== 'after' ? $pos.before() : $pos.after();
            const tr = state.tr.replaceWith(insertPos, insertPos, type.createAndFill());
            tr.setSelection(Selection.near(tr.doc.resolve(insertPos), 1));
            dispatch(tr.scrollIntoView());
        }
        return true;
    };
}
