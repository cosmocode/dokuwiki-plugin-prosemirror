import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { Node, Schema } from '../dist/prosemirror.js';
import getSpec from '../script/schema.js';
import {
    getLinkDisplayAttributes, getLinkText, isAllowedExternalUrl, linkToDOM, parseLinkAttributes,
    retargetLink, sanitizeImageHtml,
} from '../script/linkHelpers.js';

globalThis.window = globalThis.window || {};
globalThis.DOKU_BASE = '/';

const schema = new Schema(getSpec());
const attrSpecs = schema.nodes.link.spec.attrs;

/** The schemes of core's conf/scheme.conf, as JSINFO.URL_SCHEMES has them */
const SCHEMES = ['http', 'https', 'telnet', 'gopher', 'wais', 'ftp', 'ed2k', 'irc', 'ldap'];

/**
 * Copy of core's LinkWizard.createRelativeID() from lib/scripts/linkwiz.js
 *
 * @param {string} ref
 * @param {string} id
 * @return {string}
 */
function createRelativeID(ref, id) {
    const sourceNs = ref.split(':');
    sourceNs.pop();
    const targetNs = id.split(':');
    const targetPage = targetNs.pop();
    const relativeID = [];
    let commonPrefixLength = 0;
    while (
        commonPrefixLength < sourceNs.length
        && commonPrefixLength < targetNs.length
        && sourceNs[commonPrefixLength] === targetNs[commonPrefixLength]
    ) {
        commonPrefixLength += 1;
    }
    if (sourceNs.length) {
        if (commonPrefixLength) {
            if (commonPrefixLength === sourceNs.length && commonPrefixLength === targetNs.length) {
                // same namespace
            } else if (commonPrefixLength < sourceNs.length) {
                relativeID.push(...Array(sourceNs.length - commonPrefixLength).fill('..'));
            } else {
                relativeID.push('.');
            }
        } else if (targetNs.length === 0) {
            relativeID.push('');
        }
        relativeID.push(...targetNs.slice(commonPrefixLength));
    } else {
        relativeID.push(...targetNs);
    }
    relativeID.push(targetPage);
    return relativeID.join(':');
}

/**
 * A stand-in for a DOM element: getAttribute() only, case-insensitive as in HTML documents
 *
 * @param {object} attrs
 * @return {{getAttribute: function(string): (string|null)}}
 */
function fakeElement(attrs) {
    const lower = {};
    Object.entries(attrs).forEach(([name, value]) => {
        if (value !== null && value !== undefined) {
            lower[name.toLowerCase()] = String(value);
        }
    });
    return { getAttribute: name => (name.toLowerCase() in lower ? lower[name.toLowerCase()] : null) };
}

/**
 * A stand-in for DOMParser that understands only a single tag with double-quoted attributes
 *
 * @param {string} html
 * @return {{body: {children: object[]}}}
 */
function fakeParseHtml(html) {
    const tags = [...html.matchAll(/<([a-z]+)((?:\s+[a-z-]+="[^"]*")*)\s*\/?>/gi)];
    const children = tags.map(([, tagName, attrString]) => {
        const attrs = {};
        [...attrString.matchAll(/([a-z-]+)="([^"]*)"/gi)].forEach(([, name, value]) => {
            attrs[name] = value.replace(/&amp;/g, '&');
        });
        return { tagName, ...fakeElement(attrs) };
    });
    return { body: { children } };
}

/**
 * Parse an <a> as pasted into the given page
 *
 * @param {object} domAttrs
 * @param {string} currentId
 * @return {object|false}
 */
function paste(domAttrs, currentId = 'wiki:start') {
    return parseLinkAttributes(fakeElement(domAttrs), attrSpecs, {
        currentId,
        createRelativeID,
        parseHtml: fakeParseHtml,
        schemes: SCHEMES,
    });
}

/**
 * All link nodes from the _test/json fixtures, with their default attributes filled in
 *
 * @return {Array<{file: string, node: Node}>}
 */
function fixtureLinks() {
    const dir = new URL('../_test/json/', import.meta.url);
    const links = [];
    readdirSync(dir).filter(file => file.endsWith('.json')).forEach((file) => {
        const doc = Node.fromJSON(schema, JSON.parse(readFileSync(new URL(file, dir), 'utf8')));
        doc.descendants((node) => {
            if (node.type.name === 'link') {
                links.push({ file, node });
            }
        });
    });
    return links;
}

test('every fixture link survives copy and paste on the same page', () => {
    const links = fixtureLinks();
    assert.ok(links.length > 20);
    links.forEach(({ file, node }) => {
        const [, domAttrs] = linkToDOM(node.attrs, 'wiki:syntax', null, SCHEMES);
        // the <img> is rebuilt with its attributes in a fixed order
        // the interwiki URL is dropped
        const expected = {
            ...node.attrs,
            'data-resolvedImage': sanitizeImageHtml(node.attrs['data-resolvedImage'], fakeParseHtml),
            'data-resolvedUrl': null,
        };
        assert.deepEqual(paste(domAttrs, 'wiki:syntax'), expected, file);
        if (node.attrs['data-resolvedImage']) {
            assert.notEqual(expected['data-resolvedImage'], '', file);
        }
    });
});

test('the copied <a> has text, href, title and class', () => {
    const [tag, domAttrs, text] = linkToDOM({
        'data-type': 'internallink',
        'data-inner': 'syntax',
        'data-resolvedID': 'wiki:syntax',
        'data-resolvedName': 'Syntax',
        'data-resolvedTitle': 'wiki:syntax',
        'data-resolvedClass': 'wikilink1',
    }, 'wiki:start', 'https://wiki.example/doku.php?id=wiki:start', SCHEMES);
    assert.equal(tag, 'a');
    assert.equal(text, 'Syntax');
    assert.equal(domAttrs.href, 'https://wiki.example/doku.php?id=wiki:syntax');
    assert.equal(domAttrs.title, 'wiki:syntax');
    assert.equal(domAttrs.class, 'wikilink1');
    assert.equal(domAttrs['data-sourceid'], 'wiki:start');
});

test('an interwiki link without resolved URL is copied without href', () => {
    const [, domAttrs] = linkToDOM({ 'data-type': 'interwikilink', 'data-inner': 'doku>x' }, null, null, SCHEMES);
    assert.equal('href' in domAttrs, false);
    assert.equal('data-sourceid' in domAttrs, false);
});

test('isAllowedExternalUrl', () => {
    assert.ok(isAllowedExternalUrl('https://example.com/x', SCHEMES));
    assert.ok(isAllowedExternalUrl('HTTPS://example.com/x', SCHEMES));
    assert.ok(isAllowedExternalUrl('ftp://example.com/x', SCHEMES));
    assert.ok(isAllowedExternalUrl('news://example.com/x', [...SCHEMES, 'news']));
    assert.equal(isAllowedExternalUrl('news://example.com/x', SCHEMES), false);
    assert.equal(isAllowedExternalUrl('javascript://%0Aalert(1)', SCHEMES), false);
    assert.equal(isAllowedExternalUrl('javascript:alert(1)', SCHEMES), false);
    assert.equal(isAllowedExternalUrl(' https://example.com/x', SCHEMES), false);
    assert.equal(isAllowedExternalUrl('ht\ttps://example.com/x', SCHEMES), false);
    assert.equal(isAllowedExternalUrl('data:text/html,x', SCHEMES), false);
    assert.equal(isAllowedExternalUrl('https://example.com/x', undefined), false);
});

test('an external link with a scheme that is not allowed has no href', () => {
    const attrs = { 'data-type': 'externallink', 'data-inner': 'javascript://%0Aalert(1)' };
    assert.equal(getLinkDisplayAttributes(attrs, SCHEMES).href, false);
    const [, domAttrs] = linkToDOM(attrs, null, 'https://wiki.example/', SCHEMES);
    assert.equal('href' in domAttrs, false);
    const ok = { 'data-type': 'externallink', 'data-inner': 'https://example.com/' };
    assert.equal(getLinkDisplayAttributes(ok, SCHEMES).href, 'https://example.com/');
    // without a scheme list, no external link gets an href
    assert.equal(getLinkDisplayAttributes(ok, undefined).href, false);
});

test('a resolved URL is used only for interwiki links', () => {
    const resolvedUrl = 'https://example.com/';
    const ext = { 'data-type': 'externallink', 'data-inner': 'javascript://x', 'data-resolvedUrl': resolvedUrl };
    assert.equal(getLinkDisplayAttributes(ext, SCHEMES).href, false);
    const iw = { 'data-type': 'interwikilink', 'data-inner': 'doku>x', 'data-resolvedUrl': resolvedUrl };
    assert.equal(getLinkDisplayAttributes(iw, SCHEMES).href, resolvedUrl);
});

test('getLinkText', () => {
    const internal = { 'data-type': 'internallink', 'data-inner': 'ns:page#sec' };
    assert.equal(getLinkText(internal), 'page');
    assert.equal(getLinkText({ ...internal, 'data-resolvedName': 'Page' }), 'Page');
    assert.equal(getLinkText({ ...internal, 'data-name': 'Custom', 'data-resolvedName': 'Page' }), 'Custom');
    assert.equal(getLinkText({ ...internal, 'image-id': 'wiki:logo.png', 'data-resolvedName': 'Page' }), 'wiki:logo.png');
    assert.equal(getLinkText({ ...internal, 'image-id': 'wiki:logo.png', 'image-title': 'Logo' }), 'Logo');
    assert.equal(getLinkText({ 'data-type': 'interwikilink', 'data-inner': 'doku>plugin:x' }), 'plugin:x');
    assert.equal(getLinkText({ 'data-type': 'emaillink', 'data-inner': 'a@b.c' }), 'a@b.c');
});

test('the link text is the plain-text clipboard content', () => {
    const doc = Node.fromJSON(schema, {
        type: 'doc',
        content: [{
            type: 'paragraph',
            content: [
                { type: 'text', text: 'see ' },
                { type: 'link', attrs: { 'data-type': 'internallink', 'data-inner': 'ns:page' } },
            ],
        }],
    });
    assert.equal(doc.textBetween(0, doc.content.size), 'see page');
});

test('pasted links of unknown or unsafe types are rejected', () => {
    assert.equal(paste({ 'data-type': 'foo', 'data-inner': 'x' }), false);
    assert.equal(paste({ 'data-type': 'windowssharelink', 'data-inner': '\\\\server\\share' }), false);
    assert.equal(paste({ 'data-type': 'locallink', 'data-inner': '#x' }), false);
    assert.equal(paste({ 'data-type': 'internallink' }), false);
    assert.equal(paste({ 'data-type': 'other', 'data-inner': 'javascript:alert(1)' }), false);
    assert.equal(paste({ 'data-type': 'externallink', 'data-inner': 'javascript:alert(1)' }), false);
    assert.equal(paste({ 'data-type': 'externallink', 'data-inner': ' JavaScript:alert(1)' }), false);
    assert.equal(paste({ 'data-type': 'externallink', 'data-inner': 'java\tscript:alert(1)' }), false);
    assert.equal(paste({ 'data-type': 'externallink', 'data-inner': 'data:text/html,x' }), false);
    assert.equal(paste({ 'data-type': 'externallink', 'data-inner': 'javascript://%0Aalert(1)' }), false);
    assert.equal(paste({ 'data-type': 'externallink', 'data-inner': 'news://example.com/x' }), false);
    assert.ok(paste({ 'data-type': 'externallink', 'data-inner': 'ftp://example.com/x' }));
    assert.ok(paste({ 'data-type': 'other', 'data-inner': '\\\\server\\share' }));
});

test('a pasted resolved URL is dropped', () => {
    const attrs = paste({
        'data-type': 'interwikilink',
        'data-inner': 'doku>x',
        'data-resolvedUrl': 'javascript:alert(1)',
    });
    assert.equal(attrs['data-resolvedUrl'], null);
    assert.equal(getLinkDisplayAttributes(attrs, SCHEMES).href, false);
    const iw = paste({
        'data-type': 'interwikilink',
        'data-inner': 'doku>x',
        'data-resolvedUrl': 'https://www.dokuwiki.org/x',
        'data-resolvedClass': 'interwikilink interwiki iw_doku',
    });
    assert.equal(iw['data-resolvedUrl'], null);
    assert.equal(iw['data-resolvedClass'], 'interwikilink interwiki iw_doku');
});

test('sanitizeImageHtml', () => {
    const good = '<img src="/lib/exe/fetch.php?w=20&amp;media=wiki:logo.png" class="media" loading="lazy" '
        + 'title="Logo" alt="Logo" width="20" />';
    assert.equal(
        sanitizeImageHtml(good, fakeParseHtml),
        '<img src="/lib/exe/fetch.php?w=20&amp;media=wiki:logo.png" class="media" width="20" alt="Logo" '
        + 'title="Logo" loading="lazy" />',
    );
    assert.equal(
        sanitizeImageHtml('<img src="https://x/a.png" onerror="alert(1)" />', fakeParseHtml),
        '<img src="https://x/a.png" />',
    );
    assert.equal(sanitizeImageHtml('<img src="javascript:alert(1)" />', fakeParseHtml), '');
    assert.equal(sanitizeImageHtml('<img onerror="alert(1)" />', fakeParseHtml), '');
    assert.equal(sanitizeImageHtml('<script>alert(1)</script>', fakeParseHtml), '');
    assert.equal(sanitizeImageHtml('<img src="a.png" /><img src="b.png" />', fakeParseHtml), '');
    assert.equal(sanitizeImageHtml('<svg onload="alert(1)" />', fakeParseHtml), '');
    assert.equal(sanitizeImageHtml('', fakeParseHtml), '');
    // attribute values are escaped when the <img> is rebuilt
    const parseQuoted = () => ({
        body: { children: [{ tagName: 'IMG', ...fakeElement({ src: 'a.png', title: '"><script>' }) }] },
    });
    assert.equal(
        sanitizeImageHtml('ignored', parseQuoted),
        '<img src="a.png" title="&quot;&gt;&lt;script&gt;" />',
    );
});

test('retargetLink', () => {
    const link = (inner, resolvedID) => ({
        'data-type': 'internallink', 'data-inner': inner, 'data-resolvedID': resolvedID,
    });
    const target = (attrs, source, current) => retargetLink(attrs, source, current, createRelativeID)['data-inner'];

    // same page: the author's form is kept
    assert.equal(target(link('.:syntax', 'wiki:syntax'), 'wiki:start', 'wiki:start'), '.:syntax');
    assert.equal(target(link('#sec', 'wiki:start#sec'), 'wiki:start', 'wiki:start'), '#sec');
    // absolute targets are kept
    assert.equal(target(link(':wiki:syntax', 'wiki:syntax'), 'wiki:start', 'other:start'), ':wiki:syntax');
    // no resolved ID: kept
    assert.equal(target(link('syntax', null), 'wiki:start', 'other:start'), 'syntax');
    // same namespace
    assert.equal(target(link('.:syntax', 'wiki:syntax'), 'wiki:start', 'wiki:other'), 'syntax');
    // other namespace
    assert.equal(target(link('syntax', 'wiki:syntax'), 'wiki:start', 'projects:start'), 'wiki:syntax');
    assert.equal(target(link('..:syntax', 'wiki:syntax'), 'wiki:sub:start', 'wiki:sub:deeper:x'), '..:..:syntax');
    assert.equal(target(link('sub:page', 'wiki:sub:page'), 'wiki:start', 'wiki:other'), '.:sub:page');
    // section and query are kept
    assert.equal(target(link('#sec', 'wiki:syntax#sec'), 'wiki:syntax', 'wiki:start'), 'syntax#sec');
    assert.equal(target(link('page?a=b', 'ns:page'), 'ns:start', 'other:start'), 'ns:page?a=b');
    assert.equal(target(link('page#sec', 'ns:page#sec'), 'ns:start', 'other:start'), 'ns:page#sec');
    // root namespace
    assert.equal(target(link('page', 'page'), 'start', 'ns:start'), ':page');
    assert.equal(target(link('ns:page', 'ns:page'), 'ns:start', 'start'), 'ns:page');
    // no source ID (HTML from an older editor version): rewritten
    assert.equal(target(link('syntax', 'wiki:syntax'), null, 'projects:start'), 'wiki:syntax');
    // other link types are never changed
    const ext = { 'data-type': 'externallink', 'data-inner': 'https://x' };
    assert.equal(retargetLink(ext, 'a', 'b', createRelativeID), ext);
});

test('a relative link pasted into another namespace is rewritten', () => {
    const attrs = {
        'data-type': 'internallink',
        'data-inner': 'syntax',
        'data-resolvedID': 'wiki:syntax',
    };
    const [, domAttrs] = linkToDOM(attrs, 'wiki:start', null, SCHEMES);
    assert.equal(paste(domAttrs, 'projects:start')['data-inner'], 'wiki:syntax');
    assert.equal(paste(domAttrs, 'wiki:other')['data-inner'], 'syntax');
});
