
const { toggleMark, setBlockType, wrapIn } = require('prosemirror-commands');
const { MenuPlugin } = require('./MenuPlugin');
const { MenuItem } = require('./MenuItem');
const { schema } = require('./schema');

// Helper function to create menu icons
function icon(text, name) {
    const span = document.createElement('span');
    span.className = `menuicon ${name}`;
    span.title = name;
    span.textContent = text;
    return span;
}

// Create an icon for a heading at the given level
function heading(level) {
    return {
        command: setBlockType(schema.nodes.heading, { level }),
        dom: icon(`H${level}`, 'heading'),
    };
}

const underline = new MenuItem({
    command: toggleMark(schema.marks.underline),
    dom: icon('u', 'underline'),
});

const link = new MenuItem({
    command: (state, dispatch, editorView) => {
        const { $from } = state.selection;
        const index = $from.index();
        if (!$from.parent.canReplaceWith(index, index, schema.nodes.link)) {
            return false;
        }
        if (dispatch) {
            dispatch(state.tr
                .replaceSelectionWith(schema.nodes.link.create({
                    'data-type': 'internallink',
                    'data-inner': 'FIXME',
                })));
        }
        return true;
    },
    dom: icon('L', 'Link'),
});


const menu = MenuPlugin([
    { command: toggleMark(schema.marks.strong), dom: icon('B', 'strong') },
    { command: toggleMark(schema.marks.em), dom: icon('i', 'em') },
    underline,
    link,
    { command: setBlockType(schema.nodes.paragraph), dom: icon('p', 'paragraph') },
    heading(1), heading(2), heading(3),
    { command: wrapIn(schema.nodes.blockquote), dom: icon('>', 'blockquote') },
]);

exports.menu = menu;
