import AbstractNodeView from './AbstractNodeView';

class PluginInlineView extends AbstractNodeView {
    /**
     * @param {object} attrs the attributes that will be added to the dom node
     *
     * @return {void}
     */
    renderNode(attrs) {
        if (!this.dom) {
            this.dom = document.createElement('code');
            this.contentDOM = document.createElement('span');
            this.dom.appendChild(this.contentDOM);
        }
        Object.entries(attrs).forEach(([key, value]) => this.dom.setAttribute(key, value));
    }
}

export default PluginInlineView;
