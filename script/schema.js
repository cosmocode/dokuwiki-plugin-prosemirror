/**
 * Defines a custom Schema for DokuWiki
 *
 * extends the basic schemas provided by ProseMirror
 */

import { schema as schemaBasic } from 'prosemirror-schema-basic';
import { tableNodes } from 'prosemirror-tables';
import { bulletList, listItem, orderedList } from 'prosemirror-schema-list';

export default function getSpec() {
    let { nodes, marks } = schemaBasic.spec;

    const doc = nodes.get('doc');
    doc.content = '(block | baseonly | container | protected_block | substitution_block)+';
    doc.attrs = {
        nocache: { default: false },
        notoc: { default: false },
    };
    nodes = nodes.update('doc', doc);

    // heading shall only contain unmarked text
    const heading = nodes.get('heading');
    heading.content = 'text*';
    heading.marks = '';
    heading.group = 'baseonly';
    nodes = nodes.update('heading', heading);

    orderedList.group = 'container';
    orderedList.content = 'list_item+';
    nodes = nodes.update('ordered_list', orderedList);

    bulletList.group = 'container';
    bulletList.content = 'list_item+';
    nodes = nodes.update('bullet_list', bulletList);

    listItem.content = '(paragraph | protected_block | substitution_block)+ (ordered_list | bullet_list)?';
    nodes = nodes.update('list_item', listItem);

    nodes = nodes.append(tableNodes({
        tableGroup: 'container',
        cellContent: '(paragraph | protected_block | substitution_block)+',
        cellAttributes: {
            align: {
                default: '',
                setDOMAttr(val, attr) {
                    if (!val) {
                        // eslint-disable-next-line no-param-reassign
                        attr.class = null;
                        return;
                    }
                    // eslint-disable-next-line no-param-reassign
                    attr.class = `${val}align`;
                },
            },
        },
    }));

    const tableNode = nodes.get('table');
    tableNode.toDOM = function toDOM() {
        return ['div', { class: 'table' }, ['table', { class: 'inline' }, ['tbody', 0]]];
    };
    nodes.update('table', tableNode);

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
        'data-filename': { default: '' },
        'data-language': { default: '' },
		'data-sln': { default: '' },
		'data-sln-old': { default: '' },
		'data-hle': { default: '' },
    };
    codeBlock.toDOM = function toDOM(node) {
        return ['pre', node.attrs, 0];
    };
    codeBlock.group = 'protected_block';
    nodes = nodes.update('code_block', codeBlock);

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
    imageNode.parseDOM = [
        {
            tag: 'img.media,img.medialeft,img.mediacenter,img.mediaright', // FIXME: handle a.media as well
            getAttrs: function getAttrs(dom) {
                const src = dom.getAttribute('src');
                const dokuWikiFetch = `${DOKU_BASE}lib/exe/fetch.php`;
                if (!src.includes(dokuWikiFetch)) {
                    return undefined; // let another rule handle this case
                }
                const [, query] = src.split('?');
                const attrs = query.split('&')
                    .map(item => item.split('='))
                    .reduce((acc, [key, value]) => {
                        acc[key] = decodeURIComponent(value);
                        return acc;
                    }, {});
                let align = '';
                if (dom.classList.contains('medialeft')) {
                    align = 'left';
                } else if (dom.classList.contains('mediaright')) {
                    align = 'right';
                } else if (dom.classList.contains('mediacenter')) {
                    align = 'center';
                }
                return {
                    id: attrs.media,
                    title: dom.getAttribute('alt'),
                    width: attrs.w,
                    height: attrs.h,
                    align,
                    'data-resolvedHtml': dom.outerHTML,
                };
            },
        },
        {
            // handle generice images copied from other pages
            tag: 'img[src]:not(.icon)',
            getAttrs(dom) {
                const src = dom.getAttribute('src');
                return {
                    id: src,
                    title: dom.getAttribute('alt') || dom.getAttribute('title'),
                    width: dom.getAttribute('width'),
                    height: dom.getAttribute('height'),
                };
            },
        },
    ];
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
        content: '',
        marks: '',
        attrs: {
            contentJSON: { default: '' },
        },
        group: 'inline',
        inline: true,
        atom: true,
    });

    nodes = nodes.addToEnd('smiley', {
        attrs: {
            icon: {},
            syntax: {},
        },
        inline: true,
        group: 'inline',
        draggable: true,
        toDOM: node => ['img', {
            src: `${DOKU_BASE}lib/images/smileys/${node.attrs.icon}`,
            alt: node.attrs.syntax,
            class: 'icon',
        }],
        parseDOM: [{
            tag: 'img.icon',
            getAttrs: (dom) => {
                const src = dom.getAttribute('src').split('/');
                const icon = src.pop();
                if (!src.join('/').endsWith('lib/images/smileys')) {
                    return false;
                }
                const syntax = dom.getAttribute('alt');
                return { icon, syntax };
            },
        }],
    });

    nodes = nodes.addToEnd('rss', {
        group: 'substitution_block',
        atom: true,
        attrs: {
            class: { default: 'rss' },
            url: {},
            max: { default: 8 },
            reverse: { default: null },
            author: { default: null },
            date: { default: null },
            details: { default: null },
            refresh: { default: '' },
            renderedHTML: { default: null },
        },
    });

    nodes = nodes.addToEnd('dwplugin_block', {
        content: 'text*',
        marks: '',
        attrs: {
            class: { default: 'dwplugin' },
            'data-pluginname': { default: ' ' },
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
        attrs: {
            class: { default: 'dwplugin' },
            'data-pluginname': { default: ' ' },
        },
        marks: '',
        draggable: true,
        inline: true,
        group: 'inline',
        defining: true,
        isolating: true,
        code: true,
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

    if (window.Prosemirror && window.Prosemirror.pluginSchemas) {
        window.Prosemirror.pluginSchemas.forEach((addSchema) => {
            ({ nodes, marks } = addSchema(nodes, marks));
        });
    }

    return { nodes, marks };
}
