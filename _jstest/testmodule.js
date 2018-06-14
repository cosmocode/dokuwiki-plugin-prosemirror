import { Node } from 'prosemirror-model';
import schema from '../script/schema.js';

function testJsonAgainstSchema(jsonInput) {
    const node = Node.fromJSON(schema, JSON.parse(jsonInput));
    node.check();
}

export default testJsonAgainstSchema;
