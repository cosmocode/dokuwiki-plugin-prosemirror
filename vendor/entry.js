/**
 * Entry point for vendor/prosemirror.js, built with `npm run vendor`
 *
 * Browsers cannot resolve bare `prosemirror-*` specifiers, so the editor's modules import
 * everything from the prebuilt vendor/prosemirror.js instead. Bundling all packages into one
 * file guarantees a single copy of each, which ProseMirror requires (`instanceof` checks,
 * schema identity).
 *
 * If more than one package exports the same name, `export *` drops that name from the bundle,
 * and esbuild gives no warning. No current package does that; vendor/check.js reports it after
 * each build. Re-export such a name explicitly from the package it should come from, e.g.
 * `export { name } from 'prosemirror-model';`.
 */
export * from 'prosemirror-model';
export * from 'prosemirror-transform';
export * from 'prosemirror-state';
export * from 'prosemirror-view';
export * from 'prosemirror-commands';
export * from 'prosemirror-history';
export * from 'prosemirror-inputrules';
export * from 'prosemirror-keymap';
export * from 'prosemirror-schema-basic';
export * from 'prosemirror-schema-list';
export * from 'prosemirror-tables';
