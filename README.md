# prosemirror Plugin for DokuWiki
[![Build Status](https://travis-ci.org/cosmocode/dokuwiki-plugin-prosemirror.svg?branch=master)](https://travis-ci.org/cosmocode/dokuwiki-plugin-prosemirror) [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/cosmocode/dokuwiki-plugin-prosemirror/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/cosmocode/dokuwiki-plugin-prosemirror/?branch=master)

A WYSIWYG editor for DokuWiki

All documentation for this plugin can be found at 
https://www.dokuwiki.org/plugin:prosemirror

If you install this plugin manually, make sure it is installed in 
``lib/plugins/prosemirror/`` - if the folder is called different it
will not work!

Please refer to http://www.dokuwiki.org/plugins for additional info
on how to install plugins in DokuWiki.

## Development Setup

Use yarn to install the dependecies

    yarn

Create a develoment bundle:

    yarn dev

Automatically recreate the bundle during development:

    yarn watch

Build a release

    yarn build

We really recommend yarn, but npm should work, too.

## Architecture

### Dataflow

#### Begin Edit-Session: DokuWiki -> Prosemirror
- `action/editor.php`: `HTML_EDITFORM_OUTPUT` get Instructions and render them to json
  - see `renderer.php`
  - `renderer.php` uses the classes `NodeStack` `Node` and `Mark` in `schema` to do its job
    - this should possibly renamed
  - to keep information about a Node in as few places as possible,
  some rendering instructions have been moved to the respective `parser/` classes
- Prosemirror parses that json in `script/main.js` according to the schema defined in
`script/schema.js` and creates its `doc`-Node from it.

#### Rendering: Prosemirror -> DokuWiki -> Prosemirror
- Some Nodes (e.g. images, links) need to be resolved by DokuWiki in order to be rendered properly.
- So ProseMirror makes ajax requests
  - triggered by `LinkForm.resolveSubmittedLinkData` in `script/LinkForm.js`
- the request is handled by `action/ajax.php` which resolves the link/images and returns
the resolved html to be rendered into Prosemirror


#### Saving/Preview: Prosemirror -> DokuWiki
- Prosemirror synchronizes all changes with the underlying json in the `<input>` field
- When the Editform is submitted that data has to be parsed by DokuWiki into DokuWiki-Syntax.
- This starts in `action/parser.php` during the event `ACTION_ACT_PREPROCESS`
  - The main challenge is that Prosemirror operates on a flat array, whereas DokuWiki-Syntax is usually a tree
  - This means that the Syntax `**bold __underlined and bold__**` is represented in Prosemirror's data as
  `[{text: "bold ", marks: [bold]}, {text: "underlined and bold", marks: [bold, underlined]}]`
  - The creation of that syntax tree is started in `parser/SyntaxTreeBuilder.php`
  - Handling marks is complex and subtle:
    - To know in which order we have to open/close marks we need to know which start
    earlier or end later
    - for this purpose, `InlineNodeInterface::getStartingNodeMarkScore($markType)`
    and `Mark::tailLength` play together
    - for `getStartingNodeMarkScore()` to work, it needs the inline nodes inside a block node to be
    chained together, so we can ask the previous node whether it has a given node or not
    - If the marks on a node have the same start/end than they need a stable order in which they appear.
    That is defined in `Mark::markOrder`

### Our Prosemirror JS setup
Currently all our prosemirror scripts are in `script/`.
This definietly needs some better organisation.
I can see the following possible groups:
- NodeViews and Forms
  - if a Node cannot be simply rendered and edited by ProseMirror, it needs a NodeView
  - Examples are links, images, footnotes(NodeView not yet implemented)
  - possibly also `<code>` and `<file>`?
- Menu-Related classes and menu items
- keyboard commands
- possibly `commands` in general wich then can be used by menu-items and keyboard-events?
- the schema

These files are compiled with webpack and transpiled with Babel into `lib/bundle.js`,
which is the file actually included by DokuWiki.

## Testing
The central test-data is the collection of DokuWiki-Syntax and corresponding Prosemirror JSON
in `_test/json/`. This data is used for three sets of tests:
1. Testing the rendering of DokuWiki-Syntax to Prosemirror JSON in `_test/renderer.test.php`
1. Testing the parsing of Prosemirror JSON back to the original DokuWiki-Syntax in `_test/jsonParser.test.php`
1. Testing the validity of the Prosemirror JSON against the schema (`script/schema.js`) in `_jstest/test.js`

The rendering and parsing tests are run as usual DokuWiki tests.
The javascript tests are run with `yarn test`

The scripts in `script/` are also checked when building with eslint.
Eslint can also be run on its own with `yarn eslint`.

## Copyright
Copyright (C) Andreas Gohr <gohr@cosmocode.de>

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; version 2 of the License

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

See the COPYING file in your DokuWiki folder for details
