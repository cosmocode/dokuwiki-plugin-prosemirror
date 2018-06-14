class AbstractNodeView {
    constructor(node, view, getPos) {
        this.node = node;
        this.outerView = view;
        this.getPos = getPos;

        this.renderNode(node.attrs);
    }

    renderNode(attrs) {
        console.log(this.node, attrs);
        throw Error('renderNode must be implemented by child class!');
    }

    static unsetPrefixAttributes($prefix, attributes) {
        const cleanedAttributes = {};
        Object.keys(attributes).forEach((attr) => {
            if (attr.substr(0, $prefix.length) !== $prefix) {
                cleanedAttributes[attr] = attributes[attr];
            }
        });
        return cleanedAttributes;
    }
}

export default AbstractNodeView;
