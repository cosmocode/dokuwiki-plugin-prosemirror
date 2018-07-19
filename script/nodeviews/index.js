import LinkView from './LinkView';
import MediaView from './MediaView';
import PluginInlineView from './PluginInlineView';
import CodeView from './CodeView';
import RSSView from './RSSView';
// todo: this causes a cycle -- fix it
import FootnoteView from './FootnoteView'; // eslint-disable-line import/no-cycle

function getNodeViews() {
    return {
        link(node, outerview, getPos) {
            return new LinkView(node, outerview, getPos);
        },
        image(node, outerview, getPos) {
            return new MediaView(node, outerview, getPos);
        },
        dwplugin_inline(node, outerview, getPos) {
            return new PluginInlineView(node, outerview, getPos);
        },
        code_block(node, outerview, getPos) {
            return new CodeView(node, outerview, getPos);
        },
        rss(node, outerview, getPos) {
            return new RSSView(node, outerview, getPos);
        },
        footnote(node, outerview, getPos) {
            return new FootnoteView(node, outerview, getPos);
        },
        ...window.Prosemirror.pluginNodeViews,
    };
}

export default getNodeViews;
