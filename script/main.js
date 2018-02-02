/* eslint-disable no-unused-vars */

import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Node } from 'prosemirror-model';
import { MenuItem } from 'prosemirror-menu';
import { insertPoint } from 'prosemirror-transform';
import { buildMenuItems, exampleSetup } from 'prosemirror-example-setup';

import { schema } from './schema';


const signatureMI = new MenuItem({
    select(state) {
        const validLocation = insertPoint(state.doc, state.selection.from, schema.nodes.text);
        return validLocation !== null;
    },
    run(state, dispatch) {
        const now = new Date().toLocaleString('en-GB'); // fixme replace with jqueryUI and dformt options: https://stackoverflow.com/a/24655570/3293343
        const username = 'Max Müller'; // fixme replace with username
        const usermail = 'mueller@example.com'; // fixme replace with usermail
        const prefix = ' --- ';
        const timestring = ` ${now}`;
        const usernameFrom = state.selection.$from.pos + prefix.length;
        const usernameTo = usernameFrom + username.length;
        const signatureEnd = usernameTo + timestring.length;
        dispatch(state.tr
            .ensureMarks([])
            .insertText(prefix)
            .insertText(username)
            .addMark(
                usernameFrom,
                usernameTo,
                schema.marks.link.create({
                    href: `mailto:${usermail}`,
                }),
            )
            .insertText(timestring)
            .addMark(
                usernameFrom,
                signatureEnd,
                schema.marks.em.create(),
            )
            .ensureMarks([]));
        return true;
    },
    icon: {
        dom: (() => {
            const sigToolbarIcon = document.createElement('img');
            sigToolbarIcon.setAttribute('src', '../../images/toolbar/sig.png'); // fixme adjust path/consider svg
            return sigToolbarIcon;
        })(),
    },
    title: 'Insert Signature', // fixme use translated LANG string
});

const content = buildMenuItems(schema).fullMenu;
content.push([signatureMI]);


const plugins = exampleSetup({
    schema,
    menuContent: content,
});


// textarea holds our intial data and will be updated on editor changes
const json = document.getElementById('prosemirror_json');
const view = new EditorView(document.querySelector('#prosemirror__editor'), {
    state: EditorState.create({
        doc: Node.fromJSON(schema, JSON.parse(json.value)),
        schema,
        plugins,
    }),
    dispatchTransaction(tr) {
        console.log('run');

        view.updateState(view.state.apply(tr));

        // current state as json in text area
        const spaces = 4;
        json.value = JSON.stringify(view.state.doc.toJSON(), null, spaces);
    },

});
window.view = view.editor;
