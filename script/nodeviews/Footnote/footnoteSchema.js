import getSpec from '../../schema';

export default function getFootnoteSpec() {
    const baseSpec = getSpec();
    let footnoteSchemaNodes = baseSpec.nodes.remove('footnote').remove('heading');
    const doc = { ...footnoteSchemaNodes.get('doc') };
    doc.content = doc.content.replace(' baseonly |', '');
    footnoteSchemaNodes = footnoteSchemaNodes.update('doc', doc);

    return {
        nodes: footnoteSchemaNodes,
        marks: baseSpec.marks,
    };
}
