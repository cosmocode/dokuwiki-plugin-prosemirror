import assert from 'node:assert/strict';
import test from 'node:test';
import {
    CellSelection, EditorState, Node, Schema, TextSelection,
} from '../dist/prosemirror.js';
import getSpec from '../script/schema.js';
import HruleMenuItemDispatcher from '../script/plugins/Menu/MenuItems/HruleMenuItemDispatcher.js';

// getSpec() looks for window.Prosemirror.pluginSchemas, getMenuItem() builds the icon and label
globalThis.window = globalThis.window || {};
globalThis.document = globalThis.document || { createElement: () => ({}) };
globalThis.LANG = globalThis.LANG || { plugins: { prosemirror: {} } };

const schema = new Schema(getSpec());
const { command } = HruleMenuItemDispatcher.getMenuItem(schema).options;

const text = (str) => [{ type: 'text', text: str }];
const p = (str) => (str ? { type: 'paragraph', content: text(str) } : { type: 'paragraph' });
const hr = { type: 'horizontal_rule' };
const cell = (str) => ({ type: 'table_cell', content: [p(str)] });
const table = { type: 'table', content: [{ type: 'table_row', content: [cell('a'), cell('b')] }] };

/**
 * Create an editor state with a text selection
 *
 * @param {object[]} content the document's top-level nodes as JSON
 * @param {number} from
 * @param {number} to
 * @return {EditorState}
 */
function stateWith(content, from, to = from) {
    const doc = Node.fromJSON(schema, { type: 'doc', content });
    return EditorState.create({ schema, doc, selection: TextSelection.create(doc, from, to) });
}

/**
 * Get a document's top-level nodes as plain JSON, with all attrs
 *
 * @param {Node} doc
 * @return {object[]}
 */
function plain(doc) {
    return JSON.parse(JSON.stringify(doc.toJSON().content));
}

/**
 * The expected result of the command
 *
 * @param {object[]} content the document's top-level nodes as JSON, attrs may be left out
 * @param {number} cursor
 * @return {{doc: object[], cursor: number}}
 */
function expected(content, cursor) {
    return { doc: plain(Node.fromJSON(schema, { type: 'doc', content })), cursor };
}

/**
 * Run the command
 *
 * @param {EditorState} state
 * @return {{doc: object[], cursor: number}|false} the resulting top-level nodes and cursor, false
 *     if the command doesn't apply
 */
function run(state) {
    let result = false;
    const applies = command(state, (tr) => {
        assert.ok(tr.selection.empty);
        result = { doc: plain(tr.doc), cursor: tr.selection.from };
    });
    assert.equal(applies, result !== false);
    // without dispatch, the command only reports whether it applies
    assert.equal(command(state), applies);
    return result;
}

test('hr in the middle of a paragraph splits it, cursor after the hr', () => {
    assert.deepEqual(run(stateWith([p('foobar')], 4)), expected([p('foo'), hr, p('bar')], 7));
});

test('hr replaces the selected text', () => {
    assert.deepEqual(run(stateWith([p('foobarbaz')], 4, 7)), expected([p('foo'), hr, p('baz')], 7));
});

test('hr at the start of the page', () => {
    assert.deepEqual(run(stateWith([p('foo')], 1)), expected([hr, p('foo')], 2));
});

test('hr at the end of the page gets an empty paragraph after it', () => {
    assert.deepEqual(run(stateWith([p('foo')], 4)), expected([p('foo'), hr, p()], 7));
});

test('hr replaces an empty paragraph', () => {
    assert.deepEqual(run(stateWith([p('a'), p(), p('b')], 4)), expected([p('a'), hr, p('b')], 5));
});

test('hr before a list gets an empty paragraph after it', () => {
    const list = { type: 'bullet_list', content: [{ type: 'list_item', content: [p('bar')] }] };
    assert.deepEqual(run(stateWith([p('foo'), list], 4)), expected([p('foo'), hr, p(), list], 7));
});

test('hr before an existing hr gets an empty paragraph between them', () => {
    assert.deepEqual(
        run(stateWith([p('foo'), hr, p('bar')], 4)),
        expected([p('foo'), hr, p(), hr, p('bar')], 7),
    );
});

test('hr after an existing hr', () => {
    assert.deepEqual(run(stateWith([hr, p('foo')], 2)), expected([hr, hr, p('foo')], 3));
});

test('no hr outside of a top-level paragraph', () => {
    // [content, a position inside its text]
    const cases = {
        heading: [[{ type: 'heading', attrs: { level: 1 }, content: text('foo') }], 2],
        blockquote: [[{ type: 'blockquote', content: [p('foo')] }], 3],
        list: [[{ type: 'bullet_list', content: [{ type: 'list_item', content: [p('foo')] }] }], 4],
        code_block: [[{ type: 'code_block', content: text('foo') }], 2],
        preformatted: [[{ type: 'preformatted', content: text('foo') }], 2],
        'table cell': [[table], 5],
    };
    Object.entries(cases).forEach(([name, [content, pos]]) => {
        assert.equal(run(stateWith(content, pos)), false, name);
    });
});

test('no hr with several table cells selected', () => {
    const doc = Node.fromJSON(schema, { type: 'doc', content: [table] });
    const cells = [];
    doc.descendants((node, pos) => {
        if (node.type.name === 'table_cell') cells.push(pos);
    });
    const state = EditorState.create({ schema, doc, selection: CellSelection.create(doc, cells[0], cells[1]) });
    assert.equal(run(state), false);
});
