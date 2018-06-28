/* globals LANG */

import AbstractNodeView from './AbstractNodeView';

class CodeView extends AbstractNodeView {
    /**
     * @param {object} attrs the attributes that will be added to the dom node
     *
     * @return {void}
     */
    renderNode(attrs) {
        // console.log('render CodeView', this.node.textContent);
        console.log('render CodeView');
        window.codeNode = this.node;
        if (!this.dom) {
            this.dom = document.createElement('div');
            this.$fileDom = jQuery('<dl>').addClass('code');
            this.$title = jQuery('<dt><form>');
            this.$fn = jQuery('<input>')
                .prop('placeholder', 'file.ext')
                .on('blur', this.dispatchMetaUpdate.bind(this));
            this.$lang = jQuery('<input>')
                .prop('placeholder', 'language')
                .on('blur', this.dispatchMetaUpdate.bind(this))
                .attr('list', 'codelanguages');
            this.$title.append(this.$fn).append(this.$lang);
            this.$fileDom.append(this.$title);
            this.$contentWrapper = jQuery('<dd>');
            this.$fileDom.append(this.$contentWrapper);
            this.contentDOM = document.createElement('pre');
            this.contentDOM.setAttribute('data-exithint', LANG.plugins.prosemirror.code_block_hint);
            this.$contentWrapper.append(this.contentDOM);
            jQuery(this.dom).append(this.$fileDom);
        }

        this.$fn.val(attrs['data-filename']);
        this.$lang.val(attrs['data-language']);

        Object.entries(attrs).forEach(([key, value]) => this.dom.setAttribute(key, value));
    }

    dispatchMetaUpdate() {
        const newAttrs = {
            'data-filename': this.$fn.val(),
            'data-language': this.$lang.val(),
        };
        const nodeStartPos = this.getPos();
        this.outerView.dispatch(this.outerView.state.tr.setNodeMarkup(
            nodeStartPos,
            null,
            newAttrs,
        ));
    }

    stopEvent(event) {
        return jQuery.contains(this.$title.get(0), event.target);
    }

    update(node) {
        this.node = node;
        this.renderNode(node.attrs);
    }
}

export default CodeView;
