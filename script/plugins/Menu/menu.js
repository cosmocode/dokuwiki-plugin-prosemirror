import { toggleMark, setBlockType, wrapIn } from 'prosemirror-commands';
import { wrapInList, liftListItem, sinkListItem } from 'prosemirror-schema-list';

import MenuPlugin from './MenuPlugin';
import MenuItem from './MenuItem';
import getSvg from './MDI';
import Dropdown from './Dropdown';
import schema from '../../schema';
import MediaForm from '../../nodeviews/MediaForm';
import LinkForm from '../../nodeviews/LinkForm';
import { setBlockTypeNoAttrCheck } from '../../customCommands';

/**
 * Use an SVG for an Icon
 *
 * @param {string} mdi Icon identifier
 * @return {HTMLSpanElement} a <span> element which contains the <svg> element
 */
function svgIcon(mdi) {
    const span = document.createElement('span');
    span.innerHTML = getSvg(mdi);
    return span;
}

/**
 * Create an MenuItem to set the blocktype to a heading at the given level
 *
 * @param {int} level the level of the heading, from 1 to 6
 * @return {MenuItem} the MenuItem
 */
function heading(level) {
    return new MenuItem({
        command: setBlockType(schema.nodes.heading, { level }),
        icon: svgIcon(`format-header-${level}`),
        label: `Heading ${level}`,
    });
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
    icon: svgIcon('link-variant'),
    label: 'Insert Link',
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
    icon: svgIcon('image'),
    label: 'Insert Image',
});

const bulletList = new MenuItem({
    icon: svgIcon('format-list-bulleted'),
    command: wrapInList(schema.nodes.bullet_list, {}),
    label: 'Wrap in bullet list',
});

const orderedList = new MenuItem({
    icon: svgIcon('format-list-numbers'),
    command: wrapInList(schema.nodes.ordered_list, {}),
    label: 'Wrap in ordered list',
});

const liftListItemMenuItem = new MenuItem({
    icon: svgIcon('arrow-expand-left'),
    command: liftListItem(schema.nodes.list_item),
    label: 'Lift list item',
});
const sinkListItemMenuItem = new MenuItem({
    icon: svgIcon('arrow-expand-right'),
    command: sinkListItem(schema.nodes.list_item),
    label: 'Sink list item',
});

const paragraphMenuItem = new MenuItem({
    command: setBlockType(schema.nodes.paragraph),
    icon: svgIcon('format-paragraph'),
    label: 'Paragraph',
});

const codeBlockMenuItem = new MenuItem({
    command: setBlockTypeNoAttrCheck(schema.nodes.code_block),
    icon: svgIcon('code-braces'),
    label: 'Code Block',
});

const blockquoteMenuItem = new MenuItem({
    command: wrapIn(schema.nodes.blockquote),
    icon: svgIcon('format-quote-close'),
    label: 'Blockquote',
});

const pluginBlockMenuItem = new MenuItem({
    command: setBlockType(schema.nodes.dwplugin_block),
    icon: svgIcon('puzzle'),
    label: 'Plugin block',
});

const pluginInlineMenuItem = new MenuItem({
    command: (state, dispatch) => {
        const { $from } = state.selection;

        const index = $from.index();
        if (!$from.parent.canReplaceWith(index, index, schema.nodes.dwplugin_inline)) {
            return false;
        }
        if (dispatch) {
            let textContent = '';
            state.selection.content().content.descendants((node) => {
                textContent += node.textContent;
                return false;
            });
            if (!textContent.length) {
                textContent = 'FIXME';
            }

            dispatch(state.tr.replaceSelectionWith(schema.nodes.dwplugin_inline.createChecked(
                {},
                schema.text(textContent),
            )));
        }
        return true;
    },
    icon: svgIcon('puzzle'),
    label: 'Plugin inline',
});

/**
 * Create a MenuItem for toggeling a mark
 *
 * @param {MarkType} markType type of the mark based on the schema (e.g. schema.marks.strong )
 * @param {string} iconName identifier of the icon to use
 * @param {string} title label for the mark to be displayed to the user
 * @return {MenuItem} A MenuItem that toggles the mark
 */
function createMarkItem(markType, iconName, title) {
    /**
     * Determine if the mark is currently active at the cursor
     *
     * taken from prosemirror-example-setup
     *
     * @param {EditorState} state the editor's current state
     * @param {MarkType} type type of the mark based on the schema (e.g. schema.marks.strong )
     * @return {boolean} True if the mark is currently active
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
        icon: svgIcon(iconName),
        label: title,
        isActive: editorState => markActive(editorState, markType),
    });
}

const headingDropdown = new Dropdown(
    [
        heading(1), heading(2), heading(3), heading(4), heading(5), // eslint-disable-line no-magic-numbers
    ],
    {
        label: 'Headings',
    },
);


const commandsForPlugins = { setBlockType, setBlockTypeNoAttrCheck };
const pluginMenuItems = window.Prosemirror.pluginMenuItems
    .map(getPluginMenuItem => getPluginMenuItem(MenuItem, schema, commandsForPlugins));
const menu = MenuPlugin([
    new Dropdown([
        createMarkItem(schema.marks.strong, 'format-bold', 'strong'),
        createMarkItem(schema.marks.em, 'format-italic', 'em'),
        createMarkItem(schema.marks.underline, 'format-underline', 'underline'),
    ], { label: 'Marks' }),
    link,
    image,
    bulletList,
    orderedList,
    liftListItemMenuItem,
    sinkListItemMenuItem,
    codeBlockMenuItem,
    paragraphMenuItem,
    blockquoteMenuItem,
    headingDropdown,
    new Dropdown(
        [
            ...pluginMenuItems,
            pluginBlockMenuItem,
            pluginInlineMenuItem,
        ],
        { label: 'Plugins' },
    ),
]);

export default menu;
