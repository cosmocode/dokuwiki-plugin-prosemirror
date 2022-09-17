import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher';
import MenuItem from '../MenuItem';

export default class SmileyMenuItemDispatcher extends AbstractMenuItemDispatcher {
    constructor(icon, syntax) {
        super();

        this.icon = icon;
        this.syntax = syntax;
    }

    isAvailable(schema) { // eslint-disable-line class-methods-use-this
        return !!schema.nodes.smiley;
    }


    getMenuItem(schema) {
        if (!this.isAvailable(schema)) {
            throw new Error('Smiley nodes not in this Schema!');
        }

        function insertSmiley(icon, syntax) {
            return function dispatchSimleyInsert(state, dispatch) {
                const { $from } = state.selection;
                const index = $from.index();
                if (!$from.parent.canReplaceWith(index, index, schema.nodes.smiley)) {
                    return false;
                }
                if (dispatch) {
                    dispatch(state.tr.replaceSelectionWith(schema.nodes.smiley.create({ icon, syntax })));
                }
                return true;
            };
        }

        return new MenuItem({
            render: () => jQuery(`<img class="icon smiley"
                                       src="${DOKU_BASE}lib/images/smileys/${this.icon}" title="${this.syntax}">`)
                .css({ margin: '3px' })
                .get(0),
            command: insertSmiley(this.icon, this.syntax),
        });
    }
}
