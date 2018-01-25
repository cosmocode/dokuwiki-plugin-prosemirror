/**
 * Defines a custom Schema for DokuWiki
 *
 * extends the basic schemas provided by ProseMirror
 */

// load default schema definitions
const { Schema } = require('prosemirror-model');
const { schema } = require('prosemirror-schema-basic');
const { bulletList, orderedList, listItem } = require('prosemirror-schema-list');
const { tableNodes } = require('prosemirror-tables');

let { nodes, marks } = schema.spec;

const doc = nodes.get('doc');
doc.content = '(block | listblock | tableblock)+';
nodes = nodes.update('doc', doc);

// heading shall only contain unmarked text
const heading = nodes.get('heading');
heading.content = 'text*';
nodes.update('heading', heading);

orderedList.group = 'listblock';
orderedList.content = 'listitem+';
nodes = nodes.update('ordered_list', orderedList);

bulletList.group = 'listblock';
bulletList.content = 'listitem+';
nodes = nodes.update('bullet_list', bulletList);

listItem.group = 'listitem';
listItem.content = 'paragraph listblock?';
nodes = nodes.update('list_item', listItem);

nodes = nodes.append(tableNodes({
    tableGroup: 'tableblock',
    cellContent: 'text*',
}));


nodes = nodes.addToEnd('preformatted', {
    content: 'text',
    marks: '_',
    group: 'block',
    toDOM() {
        return ['pre', { class: 'code' }, 0];
    },
});

// fixme we may want an explizit preformatted node so can tell preformatted and <code> apart
const codeBlock = nodes.get('code_block');
codeBlock.toDOM = function toDOM() { return ['pre', { class: 'code' }, 0]; };
nodes = nodes.update('code_block', codeBlock);

nodes = nodes.addToEnd('interwikilink', {
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
});

nodes = nodes.addToEnd('internallink', {
    content: 'text|image',
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
});

nodes = nodes.addToEnd('externallink', {
    content: 'text|image',
    group: 'inline', // fixme should later be changed to substition? or add substitution?
    inline: true,
    attrs: {
        class: {},
        href: {},
        title: {},
    },
    toDOM(node) {
        return ['a', node.attrs, 0];
    },
});

nodes = nodes.addToEnd('locallink', {
    content: 'text|image',
    group: 'inline', // fixme should later be changed to substition? or add substitution?
    inline: true,
    attrs: {
        class: {},
        href: {},
        title: {},
    },
    toDOM(node) {
        return ['a', node.attrs, 0];
    },
});

nodes = nodes.addToEnd('footnote', {
    content: 'inline',
    group: 'inline',
    inline: true,
    toDOM() {
        return ['footnote', { class: 'footnote' }, 0];
    },
});

const imageNode = nodes.get('image');
imageNode.attrs.width = { default: null };
imageNode.attrs.height = { default: null };
imageNode.attrs.align = { default: null };
imageNode.attrs.class = {};
imageNode.attrs.id = {};
nodes = nodes.update('image', imageNode);

// FIXME we need a table header attribute
// FIXME what table cells can accept is to be defined
// FIXME table cells need colspan and rowspan attributes
// FIXME table cells need alignment attributes
// FIXME we don't allow stuff in links
// FIXME extend image node with additional attributes

marks = marks.addToEnd('deleted', {
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
});

marks = marks.addToEnd('underline', {
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
});

marks = marks.addToEnd('subscript', {
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
});

marks = marks.addToEnd('superscript', {
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
});


exports.schema = new Schema({
    nodes,
    marks,
});
