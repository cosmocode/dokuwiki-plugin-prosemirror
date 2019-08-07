import { inputRules, InputRule } from 'prosemirror-inputrules';
import { TextSelection } from 'prosemirror-state';
import SmileyConf from '../../custom/SmileyConf';

/**
 * Smiley input rule
 *
 * @returns {InputRule}
 */
export function smileyRule() {
    return new InputRule(SmileyConf.getRegex(), ((state, match) => {
        const { tr } = state;
        const syntax = match[0];

        // get icon corresponding to the captured group
        let group = 0;
        for (let i = 0; i < match.length; i += 1) {
            if (i > 0 && match[i] === syntax) {
                group = i;
                break;
            }
        }
        const { icon } = SmileyConf.getSmileys()[group - 1];

        tr.setSelection(TextSelection.create(tr.doc, tr.selection.from, tr.selection.from - syntax.length + 1));
        return tr.replaceSelectionWith(state.schema.nodes.smiley.create({ icon, syntax }));
    }));
}

/**
 * Rules for transforming user input
 *
 * @param {prosemirrorModel.Schema} schema
 * @returns {Plugin}
 */
export default function buildInputRules(schema) {
    const rules = [];
    if (schema.nodes.smiley) {
        rules.push(smileyRule());
    }
    return inputRules({ rules });
}
