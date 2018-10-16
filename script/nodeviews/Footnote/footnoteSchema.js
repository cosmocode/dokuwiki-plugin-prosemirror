import getSpec from '../../schema';

export default function getFootnoteSpec(getView) {
    const baseSpec = getSpec(getView);
    let footnoteSchemaNodes = baseSpec.nodes.remove('footnote').remove('heading');
    const doc = { ...footnoteSchemaNodes.get('doc') };
    const { notoc: ommitted, nocache: ommitted2, ...newDocAttrs } = doc.attrs;
    doc.attrs = newDocAttrs;
    doc.content = doc.content.replace(' baseonly |', '');
    footnoteSchemaNodes = footnoteSchemaNodes.update('doc', doc);

    return {
        nodes: footnoteSchemaNodes,
        marks: baseSpec.marks,
    };
}
