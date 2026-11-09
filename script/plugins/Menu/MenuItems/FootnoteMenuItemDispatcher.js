import { Schema } from '../../../../vendor/prosemirror.js';

import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher.js';
import MenuItem from '../MenuItem.js';
import { svgIcon } from '../MDI.js';
import getFootnoteSpec from '../../../nodeviews/Footnote/footnoteSchema.js';

export default class FootnoteMenuItemDispatcher extends AbstractMenuItemDispatcher {
    static isAvailable(schema) {
        return !!schema.nodes.footnote;
    }

    static getMenuItem(schema) {
        if (!this.isAvailable(schema)) {
            throw new Error('Footnote not available in schema!');
        }
        return new MenuItem({
            command: (state, dispatch) => {
                const { $from } = state.selection;

                const index = $from.index();
                if (!$from.parent.canReplaceWith(index, index, schema.nodes.footnote)) {
                    return false;
                }

                const selectedContent = state.selection.content().content.toJSON();
                const footnoteDoc = {
                    type: 'doc',
                    content: selectedContent || [{ type: 'paragraph' }],
                };
                try {
                    const footnoteSchema = new Schema(getFootnoteSpec());
                    footnoteSchema.nodeFromJSON(footnoteDoc);
                } catch (e) {
                    return false;
                }

                if (dispatch) {
                    const footnoteNode = schema.nodes.footnote.create({ contentJSON: JSON.stringify(footnoteDoc) });
                    dispatch(state.tr.replaceSelectionWith(footnoteNode));
                }

                return true;
            },
            icon: svgIcon('note-plus-outline'),
            label: LANG.plugins.prosemirror['label:footnote'],
        });
    }
}
