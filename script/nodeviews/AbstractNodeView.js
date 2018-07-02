class AbstractNodeView {
    /**
     *
     * @param {Node} node
     * @param {EditorView} view
     * @param {function} getPos
     */
    constructor(node, view, getPos) {
        this.node = node;
        this.outerView = view;
        this.getPos = getPos;

        this.renderNode(node.attrs);
    }

    /**
     * Render the node into this.dom
     *
     * This method must be overwritten by the subclasses!
     *
     * @param {object} attrs the attributes for the node
     */
    renderNode(attrs) {
        console.log(this.node, attrs);
        throw Error('renderNode must be implemented by child class!');
    }

    /**
     * Helper method to remove all keys with a given prefix from an object
     *
     * @param {string} prefix
     * @param {object} attributes
     *
     * @return {object} a shallow copy of the initial object with the respective keys removed
     */
    static unsetPrefixAttributes(prefix, attributes) {
        const cleanedAttributes = {};
        Object.keys(attributes).forEach((attr) => {
            if (attr.substr(0, prefix.length) !== prefix) {
                cleanedAttributes[attr] = attributes[attr];
            }
        });
        return cleanedAttributes;
    }
}

export default AbstractNodeView;
