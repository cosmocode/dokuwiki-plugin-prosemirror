/**
 * Display and clipboard logic for the `link` node
 *
 * Used by the schema (`toDOM`, `parseDOM`, `leafText` in `script/schema.js`) and by
 * `LinkView`. The schema is also loaded in Node by `npm test`, so this module must not import
 * anything and must not touch browser globals (`window`, `DOKU_BASE`, `JSINFO`, jQuery) at
 * import time.
 */

/**
 * Link types the renderer emits, see `renderer_plugin_prosemirror`
 *
 * `other` is a Windows share. The renderer never emits `windowssharelink` or `locallink`:
 * `WindowsShareLinkNode::render()` writes Windows shares as `other` and
 * `LocalLinkNode::render()` writes `[[#section]]` as `internallink`. A pasted node with either
 * type would not save, so both are rejected.
 */
export const LINK_TYPES = ['internallink', 'externallink', 'interwikilink', 'emaillink', 'other'];

/** Attributes kept when an `<img>` from the clipboard is rebuilt */
const IMAGE_ATTRIBUTES = ['src', 'class', 'width', 'height', 'alt', 'title', 'loading'];

/**
 * Whether an external link target may become a link
 *
 * The same rule as core's `Doku_Renderer_xhtml::externallink()`, which shows any other target
 * as plain text: the text before the first `://`, lower-cased, must be one of the schemes from
 * `getSchemes()` (`conf/scheme.conf`). The page source can hold any `scheme://` target, e.g.
 * `[[javascript://%0Aalert(1)]]`, so this is checked on every render, not only on paste.
 *
 * @param {string} url the link's `data-inner`
 * @param {string[]} schemes the allowed schemes, `JSINFO.URL_SCHEMES` in the browser
 * @return {boolean}
 */
export function isAllowedExternalUrl(url, schemes) {
    if (typeof url !== 'string' || !Array.isArray(schemes)) {
        return false;
    }
    const [scheme] = url.split('://');
    return schemes.includes(scheme.toLowerCase());
}

/**
 * Get the href for a link target
 *
 * @param {string} linktype the link's `data-type`
 * @param {string} inner the target, as in `data-inner` or `data-resolvedID`
 * @param {string[]} schemes the allowed schemes of external links
 * @return {string|false} false for interwiki links, which need the server to resolve them,
 *         and for external links whose scheme is not allowed
 */
export function transformInnerToHref(linktype, inner, schemes) {
    switch (linktype) {
    case 'externallink':
        return isAllowedExternalUrl(inner, schemes) ? inner : false;
    case 'emaillink':
        return `mailto:${inner}`;
    case 'internallink': {
        return `${DOKU_BASE}doku.php?id=${inner.replace('?', '&')}`;
    }
    case 'other':
        if (inner.substr(0, '\\\\'.length) === '\\\\') {
            return `file:///${inner.replace('\\', '/')}`;
        }
        return inner;
    case 'interwikilink':
        return false;
    default:
        console.log(`unknown linktype: ${linktype}`);
        return false;
    }
}

/**
 * Get a link's text when neither the wiki syntax nor the server gave one
 *
 * @param {string} linktype the link's `data-type`
 * @param {string} inner the link's `data-inner`
 * @return {string|false}
 */
export function getDefaultNameFromInner(linktype, inner) {
    switch (linktype) {
    case 'externallink':
    case 'other':
    case 'emaillink':
        return inner;
    case 'interwikilink': {
        return inner.split(/>/)[1];
    }
    case 'internallink': { // FIXME we have to get the actual name from the server via ajax
        const id = inner.split(/[?|#]/)[0];
        return id.split(':').pop();
    }
    default:
        console.warn(`unknown linktype: ${linktype}`);
        return false;
    }
}

/**
 * Get a link's title attribute when the server didn't give one
 *
 * @param {string} linktype the link's `data-type`
 * @param {string} inner the link's `data-inner`
 * @return {string|false}
 */
export function getTitleFromInner(linktype, inner) {
    switch (linktype) {
    case 'externallink':
    case 'other':
    case 'emaillink':
    case 'interwikilink':
        return inner;
    case 'internallink': { // FIXME we have to get the actual title for relative links from the server via ajax
        const id = inner.split(/[?|#]/)[0];
        return id;
    }
    default:
        console.warn(`unknown linktype: ${linktype}`);
        return false;
    }
}

/**
 * Get a link's CSS class when the server didn't give one
 *
 * @param {string} linktype the link's `data-type`
 * @return {string|false}
 */
export function getClassFromType(linktype) {
    switch (linktype) {
    case 'externallink':
        return 'urlextern';
    case 'emaillink':
        return 'mail';
    case 'interwikilink':
    case 'internallink':
        return ''; // FIXME we need ajax to show whether the page exists or not
    case 'other':
        return 'windows'; // FIXME what could other possible uses for 'other' be?
    default:
        console.log(`unknown linktype to return class from: ${linktype}`);
        return false;
    }
}

/**
 * Whether a link's name is an image
 *
 * @param {object} attrs the link node's attributes
 * @return {boolean}
 */
export function isImageLink(attrs) {
    return Boolean(attrs['image-id'] && attrs['image-id'].length > 0);
}

/**
 * Get the text a link shows
 *
 * An image link shows the image itself in the editor (`LinkView`); as text it is the image's
 * title, or its ID.
 *
 * @param {object} attrs the link node's attributes
 * @return {string}
 */
export function getLinkText(attrs) {
    if (attrs['data-name']) {
        return attrs['data-name'];
    }
    if (isImageLink(attrs)) {
        return attrs['image-title'] || attrs['image-id'];
    }
    if (attrs['data-resolvedName']) {
        return attrs['data-resolvedName'];
    }
    return getDefaultNameFromInner(attrs['data-type'], attrs['data-inner']) || '';
}

/**
 * Get the href, title and class a link has in the editor
 *
 * `data-resolvedUrl` is used only for interwiki links: the server sets it only for them, and
 * on any other type it would bypass the scheme check of an external link's target.
 *
 * @param {object} attrs the link node's attributes
 * @param {string[]} schemes the allowed schemes of external links
 * @return {{href: (string|false), title: (string|false), class: (string|false)}}
 */
export function getLinkDisplayAttributes(attrs, schemes) {
    const type = attrs['data-type'];

    let href = type === 'interwikilink' ? attrs['data-resolvedUrl'] : null;
    if (!href) {
        href = transformInnerToHref(type, attrs['data-resolvedID'] || attrs['data-inner'], schemes);
    }

    const title = attrs['data-resolvedTitle'] || getTitleFromInner(type, attrs['data-inner']);

    let cssClass;
    if (isImageLink(attrs)) {
        cssClass = 'media';
    } else if (attrs['data-resolvedClass']) {
        cssClass = attrs['data-resolvedClass'];
    } else {
        cssClass = getClassFromType(type);
    }

    return { href, title, class: cssClass };
}

/**
 * Build the `<a>` a link is copied to the clipboard as
 *
 * Carries every node attribute, so `parseLinkAttributes()` restores the node, and a real
 * href, title and text, so the link also works when pasted into other programs. The image of
 * an image link is not included, it is copied as a text link.
 *
 * @param {object} attrs the link node's attributes
 * @param {string|null} sourceId the ID of the page the link is copied from
 * @param {string|null} baseUrl the URL to resolve a relative href against, null to keep it
 * @param {string[]} schemes the allowed schemes of external links
 * @return {Array} a ProseMirror DOMOutputSpec
 */
export function linkToDOM(attrs, sourceId, baseUrl, schemes) {
    const display = getLinkDisplayAttributes(attrs, schemes);
    const domAttrs = { ...attrs };
    if (display.href) {
        let { href } = display;
        if (baseUrl) {
            try {
                href = new URL(href, baseUrl).href;
            } catch (e) {
                // keep the href as it is
            }
        }
        domAttrs.href = href;
    }
    if (display.title) {
        domAttrs.title = display.title;
    }
    if (display.class) {
        domAttrs.class = display.class;
    }
    if (sourceId) {
        domAttrs['data-sourceid'] = sourceId;
    }
    return ['a', domAttrs, getLinkText(attrs)];
}

/**
 * Escape a string for use in a double-quoted HTML attribute
 *
 * @param {string} value
 * @return {string}
 */
function escapeAttribute(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Make the image HTML of a pasted image link safe for `innerHTML`
 *
 * `LinkView` writes `data-resolvedImage` with `innerHTML`, and a web page can put any HTML
 * there. Only a single `<img>` is kept, rebuilt from an allow list of attributes, with a
 * relative or `http(s):` `src`.
 *
 * @param {string} html the pasted `data-resolvedImage`
 * @param {function(string): Document} parseHtml parses HTML into an inert document,
 *        `DOMParser` in the browser
 * @return {string} the rebuilt `<img>`, or '' if the HTML is anything else
 */
export function sanitizeImageHtml(html, parseHtml) {
    if (!html) {
        return '';
    }
    const { children } = parseHtml(html).body;
    if (children.length !== 1 || children[0].tagName.toUpperCase() !== 'IMG') {
        return '';
    }
    const img = children[0];

    const src = img.getAttribute('src');
    if (!src) {
        return '';
    }
    try {
        const { protocol } = new URL(src, 'https://relative.invalid/');
        if (protocol !== 'http:' && protocol !== 'https:') {
            return '';
        }
    } catch (e) {
        return '';
    }

    const attributes = IMAGE_ATTRIBUTES
        .filter(name => img.getAttribute(name) !== null)
        .map(name => `${name}="${escapeAttribute(img.getAttribute(name))}"`);
    return `<img ${attributes.join(' ')} />`;
}

/**
 * Make a pasted internal link point to the same page from the page it is pasted into
 *
 * `data-inner` is saved as it is, so a relative target (`syntax`, `..:page`, `#section`)
 * copied to another page would point somewhere else. It is rebuilt from the absolute
 * `data-resolvedID`, relative to the current page, keeping a `?query` and `#section`.
 *
 * @param {object} attrs the link node's attributes
 * @param {string|null} sourceId the page the link was copied from, null if unknown
 * @param {string} currentId the page the link is pasted into
 * @param {function(string, string): string} createRelativeID core's
 *        `LinkWizard.createRelativeID(ref, id)`
 * @return {object} the attributes, with `data-inner` changed if needed
 */
export function retargetLink(attrs, sourceId, currentId, createRelativeID) {
    const inner = attrs['data-inner'];
    if (
        attrs['data-type'] !== 'internallink'
        || sourceId === currentId
        || inner.startsWith(':')
        || !attrs['data-resolvedID']
    ) {
        return attrs;
    }

    const page = attrs['data-resolvedID'].split('#')[0];
    const suffix = inner.match(/[?#].*$/);
    const target = createRelativeID(currentId, page) + (suffix ? suffix[0] : '');
    return { ...attrs, 'data-inner': target };
}

/**
 * Read a link node's attributes from a pasted `<a>`
 *
 * Accepts only what `linkToDOM()` produces. Returns false for anything else, so the text is
 * pasted without the link.
 *
 * @param {{getAttribute: function(string): (string|null)}} dom the pasted element
 * @param {object} attrSpecs the link node spec's `attrs`
 * @param {object} context
 * @param {string} context.currentId the page the link is pasted into
 * @param {function(string, string): string|null} context.createRelativeID core's
 *        `LinkWizard.createRelativeID`, null to never rewrite targets
 * @param {function(string): Document} context.parseHtml parses HTML into an inert document
 * @param {string[]} context.schemes the allowed schemes of external links
 * @return {object|false}
 */
export function parseLinkAttributes(dom, attrSpecs, context) {
    let attrs = {};
    Object.entries(attrSpecs).forEach(([name, spec]) => {
        const value = dom.getAttribute(name);
        attrs[name] = value === null ? spec.default : value;
    });

    const type = attrs['data-type'];
    const inner = attrs['data-inner'];
    if (!LINK_TYPES.includes(type) || typeof inner !== 'string' || inner === '') {
        return false;
    }
    if (type === 'other' && !inner.startsWith('\\\\')) {
        return false;
    }
    if (type === 'externallink' && !isAllowedExternalUrl(inner, context.schemes)) {
        return false;
    }
    // An interwiki URL from the clipboard can't be checked: interwiki.conf may use any scheme
    // (skype:, tel:), and the URL is only right for the wiki it was copied from. Without it the
    // link has no href until the server resolves it again (page load, editor toggle, link dialog).
    attrs['data-resolvedUrl'] = null;
    attrs['data-resolvedImage'] = sanitizeImageHtml(attrs['data-resolvedImage'], context.parseHtml);

    if (context.createRelativeID && context.currentId) {
        attrs = retargetLink(attrs, dom.getAttribute('data-sourceid'), context.currentId, context.createRelativeID);
    }
    return attrs;
}
