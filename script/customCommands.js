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
 * Returns a command that inserts a hard break (DokuWiki's forced line break `\\ `) at the cursor
 *
 * The command fails where a hard break is not allowed, so that a command chained after it can
 * run instead: in code nodes, and in nodes whose content cannot hold one, such as headings.
 * The break takes over the marks at the cursor, so a break in bold text stays bold.
 *
 * @param {Schema} schema the editor schema
 * @returns {function(EditorState, function(Transaction)=): boolean} the command
 */
export function insertHardBreak(schema) {
    const hardBreak = schema.nodes.hard_break;
    return function insertHardBreakDispatch(state, dispatch) {
        const { $from } = state.selection;
        if ($from.parent.type.spec.code) return false;
        const index = $from.index();
        if (!$from.parent.canReplaceWith(index, index, hardBreak)) return false;
        if (dispatch) dispatch(state.tr.replaceSelectionWith(hardBreak.create()).scrollIntoView());
        return true;
    };
}
