import { Node, Schema } from 'prosemirror-model';
import getSpec from '../script/schema.js';

// getSpec() looks for window.Prosemirror.pluginSchemas; Node has no window
globalThis.window = globalThis.window || {};

function testJsonAgainstSchema(jsonInput) {
    const schema = new Schema(getSpec());
    const node = Node.fromJSON(schema, JSON.parse(jsonInput));
    node.check();
}

export default testJsonAgainstSchema;
