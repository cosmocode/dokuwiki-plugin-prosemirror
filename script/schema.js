/**
 * Defines a custom Schema for DokuWiki
 *
 * extends the basic schemas provided by ProseMirror
 */

// load default schema definitions
const { Schema } = require('prosemirror-model');
const { nodes, marks } = require('prosemirror-schema-basic');
const { bulletList, orderedList, listItem } = require('prosemirror-schema-list');
const { tableNodes } = require('prosemirror-tables');

// heading shall only contain unmarked text
nodes.heading.content = 'text*';

nodes.doc.content = '(block | listblock | tableblock)+';

nodes.ordered_list = orderedList;
nodes.ordered_list.group = 'listblock';
nodes.ordered_list.content = 'listitem+';

nodes.bullet_list = bulletList;
nodes.bullet_list.group = 'listblock';
nodes.bullet_list.content = 'listitem+';

nodes.list_item = listItem;
nodes.list_item.group = 'listitem';
nodes.list_item.content = 'paragraph listblock?';

const tableNodesSet = tableNodes({
    tableGroup: 'tableblock',
    cellContent: 'text*',
});

nodes.table = tableNodesSet.table;
nodes.table_row = tableNodesSet.table_row;
nodes.table_cell = tableNodesSet.table_cell;
nodes.table_header = tableNodesSet.table_header;

nodes.code_block.toDOM = function toDOM() { return ['pre', { class: 'preformatted' }, 0]; };

nodes.interwikilink = {
    content: 'text',
    marks: '_',
    group: 'inline', // fixme should later be changed to substition? or add substitution?
    inline: true,
    attrs: {
        class: {},
        href: {},
        'data-shortcut': {},
        'data-reference': {},
        title: { default: null },
    },
    toDOM(node) {
        return ['a', node.attrs, 0];
    },
    parseDom: [
        {
            tag: 'a[href].interwikilink',
            getAttrs(dom) {
                return {
                    href: dom.getAttribute('href'),
                    title: dom.getAttribute('title'),
                    'data-shortcut': dom.getAttribute('data-shortcut'),
                    'data-reference': dom.getAttribute('data-reference'),
                    class: dom.getAttribute('class'),
                };
            },
        },
    ],
};

nodes.internallink = {
    content: 'text',
    group: 'inline', // fixme should later be changed to substition? or add substitution?
    inline: true,
    attrs: {
        class: {},
        href: {},
        'data-id': {},
        'data-query': { default: null },
        'data-hash': { default: null },
        title: { default: null },
    },
    toDOM(node) {
        return ['a', node.attrs, 0];
    },
};

// FIXME we need a table header attribute
// FIXME what table cells can accept is to be defined
// FIXME table cells need colspan and rowspan attributes
// FIXME table cells need alignment attributes
// FIXME we don't allow stuff in links
// FIXME extend image node with additional attributes


marks.deleted = {
    parseDOM: [
        { tag: 'del' },
        {
            style: 'text-decoration',
            // https://discuss.prosemirror.net/t/dom-parsing-and-getattrs/612
            getAttrs: value => value === 'strikethrough' && null,
        },
    ],
    toDOM() {
        return ['del'];
    },
};

marks.underline = {
    parseDOM: [
        { tag: 'u' },
        {
            style: 'text-decoration',
            getAttrs: value => value === 'underline' && null,
        },
    ],
    toDOM() {
        return ['u'];
    },
};

marks.subscript = {
    parseDOM: [
        { tag: 'sub' },
        {
            style: 'vertical-align',
            getAttrs: value => value === 'sub' && null,
        },
    ],
    toDOM() {
        return ['sub'];
    },
};

marks.superscript = {
    parseDOM: [
        { tag: 'sup' },
        {
            style: 'vertical-align',
            getAttrs: value => value === 'super' && null,
        },
    ],
    toDOM() {
        return ['sup'];
    },
};


exports.schema = new Schema({
    nodes,
    marks,
});
