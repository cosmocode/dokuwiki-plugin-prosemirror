class AbstractNodeView {
    /**
     * Create the node and render it
     *
     * renderNode() is first called from here, before the subclass constructor. A field
     * that a subclass sets after super() (e.g. this.form) does not exist yet during that first
     * render. See RSSView for the pattern: set such fields up in the constructor and use them in
     * renderNode() only from deferred callbacks such as click handlers.
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
     * It is called from the base constructor, before the subclass constructor body, and again
     * on every update. Check this.dom to tell the first render from later ones.
     *
     * @param {object} attrs the attributes for the node
     */
    renderNode(attrs) {
        console.log(this.node, attrs);
        throw new Error('renderNode must be implemented by child class!');
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
window.AbstractNodeView = AbstractNodeView;
