import { Schema } from 'prosemirror-model';
import { spec } from '../../schema';

let footnoteSchemaNodes = spec.nodes.remove('footnote').remove('heading');
const doc = footnoteSchemaNodes.get('doc');
doc.content = doc.content.replace(' baseonly |', '');
footnoteSchemaNodes = footnoteSchemaNodes.update('doc', doc);

const footnoteSchema = new Schema({
    nodes: footnoteSchemaNodes,
    marks: spec.marks,
});

export default footnoteSchema;
