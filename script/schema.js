/**
 * Defines a custom Schema for DokuWiki
 *
 * extends the basic schemas provided by ProseMirror
 */

const { tableNodes } = require('prosemirror-tables');
const { bulletList, listItem, orderedList } = require('prosemirror-schema-list');
const { schema } = require('prosemirror-schema-basic'); // load default schema definitions
const { Schema } = require('prosemirror-model');


let { nodes, marks } = schema.spec;

const doc = nodes.get('doc');
doc.content = '(block | baseonly | container | protected_block | substitution_block)+';
nodes = nodes.update('doc', doc);

// heading shall only contain unmarked text
const heading = nodes.get('heading');
heading.content = 'text*';
heading.marks = '';
heading.group = 'baseonly';
nodes.update('heading', heading);

orderedList.group = 'container';
orderedList.content = 'list_item+';
nodes = nodes.update('ordered_list', orderedList);

bulletList.group = 'container';
bulletList.content = 'list_item+';
nodes = nodes.update('bullet_list', bulletList);

listItem.content = '(paragraph | protected_block | substitution_block)* (ordered_list | bullet_list)?';
nodes = nodes.update('list_item', listItem);

nodes = nodes.append(tableNodes({
    tableGroup: 'container',
    cellContent: 'inline*',
    cellAttributes: {
        is_header: {},
    },
}));

// Nodes: https://prosemirror.net/docs/ref/#model.NodeSpec
nodes = nodes.addToEnd('preformatted', {
    content: 'text*',
    marks: '',
    group: 'protected_block',
    code: true,
    toDOM() {
        return ['pre', { class: 'code' }, 0];
    },
});

const codeBlock = nodes.get('code_block');
codeBlock.attrs = {
    class: { default: 'code' },
    'data-filename': { default: null },
    'data-language': { default: null },
};
codeBlock.toDOM = function toDOM(node) {
    return ['pre', node.attrs, 0];
};
codeBlock.group = 'protected_block';
nodes = nodes.update('code_block', codeBlock);

nodes = nodes.addToEnd('file_block', {
    content: 'text*',
    marks: '',
    group: 'protected_block',
    attrs: {
        class: { default: 'code file' },
        'data-filename': { default: null },
        'data-language': { default: null },
    },
    code: true,
    defining: true,
    toDOM(node) {
        return ['pre', node.attrs, 0];
    },
});

nodes = nodes.addToEnd('html_block', {
    content: 'text*',
    marks: '',
    group: 'protected_block',
    attrs: {
        class: { default: 'html_block' },
    },
    code: true,
    defining: true,
    toDOM(node) {
        return ['pre', node.attrs, 0];
    },
});

nodes = nodes.addToEnd('html_inline', {
    content: 'text*',
    marks: '',
    group: 'inline',
    attrs: {
        class: { default: 'html_inline' },
    },
    inline: true,
    code: true,
    defining: true,
    toDOM(node) {
        return ['code', node.attrs, 0];
    },
});

nodes = nodes.addToEnd('php_block', {
    content: 'text*',
    marks: '',
    group: 'protected_block',
    attrs: {
        class: { default: 'php_block' },
    },
    code: true,
    defining: true,
    toDOM(node) {
        return ['pre', node.attrs, 0];
    },
});

nodes = nodes.addToEnd('php_inline', {
    content: 'text*',
    marks: '',
    group: 'inline',
    attrs: {
        class: { default: 'php_inline' },
    },
    inline: true,
    code: true,
    defining: true,
    toDOM(node) {
        return ['code', node.attrs, 0];
    },
});

const quote = nodes.get('blockquote');
quote.content = '(block | blockquote | protected_block)+';
quote.group = 'container';
quote.toDom = () => ['blockquote', {}, ['div', { class: 'no' }, 0]];
nodes.update('blockquote', quote);

const imageNode = nodes.get('image');
imageNode.attrs.width = { default: '' };
imageNode.attrs.height = { default: '' };
imageNode.attrs.align = { default: '' };
imageNode.attrs.linking = { default: '' };
imageNode.attrs.cache = { default: '' };
imageNode.attrs['data-resolvedHtml'] = { default: '' };
imageNode.attrs.id = {};
delete imageNode.attrs.src;
nodes = nodes.update('image', imageNode);

const imageAttrs = {};
Object.keys(imageNode.attrs).forEach((key) => {
    imageAttrs[`image-${key}`] = { default: null };
});

nodes = nodes.addToEnd('link', {
    group: 'inline',
    inline: true,
    attrs: {
        'data-type': {},
        'data-inner': {},
        'data-name': { default: null },
        'data-resolvedID': { default: null },
        'data-resolvedUrl': { default: null },
        'data-resolvedName': { default: null },
        'data-resolvedClass': { default: null },
        'data-resolvedTitle': { default: null },
        'data-resolvedImage': { default: '' },
        ...imageAttrs,
    },
    toDOM(node) {
        return ['a', node.attrs];
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

nodes = nodes.addToEnd('rss', {
    group: 'substitution_block',
    atom: true,
    attrs: {
        class: { default: 'rss' },
        'data-url': { default: null },
        'data-params': { default: null },
    },
    toDOM(node) {
        const url = node.attrs['data-url'] || '';
        return ['span', node.attrs, `RSS: ${url}`];
    },
});

nodes = nodes.addToEnd('dwplugin_block', {
    content: 'text*',
    marks: '_',
    attrs: {
        class: { default: 'dwplugin' },
        'data-pluginname': {},
    },
    draggable: true,
    inline: false,
    group: 'protected_block',
    defining: true,
    isolating: true,
    code: true,
    toDOM(node) {
        return ['pre', node.attrs, 0];
    },
});


nodes = nodes.addToEnd('dwplugin_inline', {
    content: 'text*',
    marks: '_',
    attrs: {
        class: { default: 'dwplugin' },
        'data-pluginname': {},
    },
    draggable: true,
    inline: true,
    group: 'inline',
    defining: true,
    isolating: true,
    code: true,
    toDOM(node) {
        return ['code', node.attrs, 0];
    },
});

// FIXME we need a table header attribute
// FIXME what table cells can accept is to be defined
// FIXME table cells need colspan and rowspan attributes
// FIXME table cells need alignment attributes
// FIXME we don't allow stuff in links
// FIXME extend image node with additional attributes

marks = marks.remove('link');

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

marks = marks.addToEnd('unformatted', {
    parseDOM: [
        { tag: 'span', class: 'unformatted' },
    ],
    toDOM() {
        return ['span', { class: 'unformatted' }];
    },
});

exports.schema = new Schema({
    nodes,
    marks,
});
