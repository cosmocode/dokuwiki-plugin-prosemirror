const { toggleMark, setBlockType, wrapIn } = require('prosemirror-commands');
const { wrapInList, liftListItem, sinkListItem } = require('prosemirror-schema-list');
const { MenuPlugin } = require('./MenuPlugin');
const { MenuItem } = require('./MenuItem');
const { schema } = require('../schema');
const { MediaForm } = require('../MediaForm');
const { LinkForm } = require('../LinkForm');
const { getSvg } = require('./MDI');

/**
 * Use an SVG for an Icon
 *
 * @param {string} mdi Icon identifier
 * @param {string} title Title to display
 * @return {HTMLSpanElement}
 */
function svgIcon(mdi, title) {
    const span = document.createElement('span');
    span.className = `menuicon ${title}`;
    span.title = title;
    span.innerHTML = getSvg(mdi);
    return span;
}

// Create an icon for a heading at the given level
function heading(level) {
    return {
        command: setBlockType(schema.nodes.heading, { level }),
        dom: svgIcon(`format-header-${level}`, 'heading'),
    };
}

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
    dom: svgIcon('link-variant', 'Link'),
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
    dom: svgIcon('image', 'Insert Image'),
});

const bulletList = new MenuItem({
    dom: svgIcon('format-list-bulleted', 'Wrap in bullet list'),
    command: wrapInList(schema.nodes.bullet_list, {}),
});

const orderedList = new MenuItem({
    dom: svgIcon('format-list-numbers', 'Wrap in ordered list'),
    command: wrapInList(schema.nodes.ordered_list, {}),
});

const liftListItemMenuItem = new MenuItem({
    dom: svgIcon('arrow-expand-left', 'Lift list item'),
    command: liftListItem(schema.nodes.list_item),
});
const sinkListItemMenuItem = new MenuItem({
    dom: svgIcon('arrow-expand-right', 'Sink list item'),
    command: sinkListItem(schema.nodes.list_item),
});

function createMarkItem(markType, iconName, title) {
    /**
     * taken from prosemirror-example-setup
     *
     * @param state
     * @param type
     * @return {boolean|*}
     */
    function markActive(state, type) {
        const {
            from, $from, to, empty,
        } = state.selection;
        if (empty) {
            return type.isInSet(state.storedMarks || $from.marks());
        }
        return state.doc.rangeHasMark(from, to, type);
    }

    return new MenuItem({
        command: toggleMark(markType),
        dom: svgIcon(iconName, title),
        isActive: editorState => markActive(editorState, markType),
    });
}


const menu = MenuPlugin([
    createMarkItem(schema.marks.strong, 'format-bold', 'strong'),
    createMarkItem(schema.marks.em, 'format-italic', 'em'),
    createMarkItem(schema.marks.underline, 'format-underline', 'underline'),
    link,
    image,
    bulletList,
    orderedList,
    liftListItemMenuItem,
    sinkListItemMenuItem,
    { command: setBlockType(schema.nodes.paragraph), dom: svgIcon('format-paragraph', 'paragraph') },
    heading(1), heading(2), heading(3),
    { command: wrapIn(schema.nodes.blockquote), dom: svgIcon('format-quote-close', 'blockquote') },
]);

exports.menu = menu;
