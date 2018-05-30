const { toggleMark, setBlockType, wrapIn } = require('prosemirror-commands');
const { MenuPlugin } = require('./MenuPlugin');
const { MenuItem } = require('./MenuItem');
const { schema } = require('./schema');
const { MediaForm } = require('./MediaForm');
const { LinkForm } = require('./LinkForm');

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
    command: (state, dispatch) => {
        const { $from } = state.selection;

        const index = $from.index();
        if (!$from.parent.canReplaceWith(index, index, schema.nodes.link)) {
            return false;
        }

        if (dispatch) {
            let textContent = '';
            state.selection.content().content.descendants((node) => {
                textContent += node.textContent;
                return false;
            });
            const linkForm = new LinkForm();
            linkForm.setLinkType('internallink');
            if (textContent) {
                linkForm.setLinkTarget(false, textContent);
                linkForm.setLinkNameType('custom', textContent);
            }

            linkForm.on('submit', LinkForm.resolveSubmittedLinkData(
                linkForm,
                {},
                (newAttrs) => {
                    const linkNode = schema.nodes.link.create(newAttrs);
                    dispatch(state.tr.replaceSelectionWith(linkNode));
                    linkForm.off('submit');
                    linkForm.hide();
                    linkForm.resetForm();
                },
            ));
            linkForm.show();
        }
        return true;
    },
    dom: icon('L', 'Link'),
});

const image = new MenuItem({
    command: (state, dispatch) => {
        const { $from } = state.selection;

        const index = $from.index();
        if (!$from.parent.canReplaceWith(index, index, schema.nodes.image)) {
            return false;
        }
        if (dispatch) {
            let textContent = '';
            state.selection.content().content.descendants((node) => {
                textContent += node.textContent;
                return false;
            });

            const mediaForm = new MediaForm();
            if (textContent) {
                mediaForm.setCaption(textContent);
                mediaForm.setSource(textContent);
            }

            mediaForm.show();

            mediaForm.on('submit', MediaForm.resolveSubmittedLinkData(
                {},
                mediaForm,
                (newAttrs) => {
                    dispatch(state.tr.replaceSelectionWith(schema.nodes.image.create(newAttrs)));
                    mediaForm.off('submit');
                    mediaForm.hide();
                    mediaForm.resetForm();
                },
            ));
        }
        return true;
    },
    dom: icon('🖼️', 'Insert Image'),
});

const menu = MenuPlugin([
    { command: toggleMark(schema.marks.strong), dom: icon('B', 'strong') },
    { command: toggleMark(schema.marks.em), dom: icon('i', 'em') },
    underline,
    link,
    image,
    { command: setBlockType(schema.nodes.paragraph), dom: icon('p', 'paragraph') },
    heading(1), heading(2), heading(3),
    { command: wrapIn(schema.nodes.blockquote), dom: icon('>', 'blockquote') },
]);

exports.menu = menu;
