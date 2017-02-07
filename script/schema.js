/**
 * Defines a custom Schema for DokuWiki
 *
 * extends the basic schemas provided by ProseMirror
 */

    // load default schema definitions
const { Schema } = require('prosemirror-model');
const { nodes, marks } = require('prosemirror-schema-basic');
const { bulletList, orderedList, listItem } = require('prosemirror-schema-list');

// heading shall only contain unmarked text
nodes.heading.content = 'text*';

nodes.doc.content = '(block | listblock)+';

nodes.ordered_list = orderedList;
nodes.ordered_list.group = 'listblock';
nodes.ordered_list.content = 'listitem+';

nodes.bullet_list = bulletList;
nodes.bullet_list.group = 'listblock';
nodes.bullet_list.content = 'listitem+';

nodes.list_item = listItem;
nodes.list_item.group = 'listitem';
nodes.list_item.content = '(paragraph | listblock)';

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


console.log(marks);

exports.schema = new Schema({
    nodes,
    marks,
});
