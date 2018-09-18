import { Step, StepResult } from 'prosemirror-transform';

/**
 * Custom step to set attributes of the root `doc` node
 *
 * @see https://discuss.prosemirror.net/t/changing-doc-attrs/784/17
 */
export default class SetDocAttrStep extends Step {
    constructor(key, value, stepType = 'SetDocAttr') {
        super();
        this.stepType = stepType;
        this.key = key;
        this.value = value;
    }

    apply(doc) {
        this.prevValue = doc.attrs[this.key];
        /* eslint-disable-next-line no-param-reassign */
        doc.attrs[this.key] = this.value;
        return StepResult.ok(doc);
    }

    invert() {
        return new SetDocAttrStep(this.key, this.prevValue, 'revertSetDocAttr');
    }

    map() {
        return null;
    }

    toJSON() {
        return {
            stepType: this.stepType,
            key: this.key,
            value: this.value,
        };
    }

    static fromJSON(json) {
        return new SetDocAttrStep(json.key, json.value, json.stepType);
    }
}
