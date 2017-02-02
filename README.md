# prosemirror Plugin for DokuWiki

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

    yarn run dev

Automatically recreate the bundle during development:

    yarn run watch

Build a release

    yarn run build

We really recommend yarn, but npm should work, too.

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
