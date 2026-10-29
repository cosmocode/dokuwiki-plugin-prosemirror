import RSSMenuItemDispatcher from './MenuItems/RSSMenuItemDispatcher.js';
import MenuPlugin from './MenuPlugin.js';
import PluginDropdownDispatcher from './MenuItems/PluginDropdownDispatcher.js';
import PluginBlockMenuItemDispatcher from './MenuItems/PluginBlockMenuItemDispatcher.js';
import LinkMenuItemDispatcher from './MenuItems/LinkMenuItemDispatcher.js';
import ImageMenuItemDispatcher from './MenuItems/ImageMenuItemDispatcher.js';
import BulletListMenuItemDispatcher from './MenuItems/BulletListMenuItemDispatcher.js';
import OrderedListMenuItemDispatcher from './MenuItems/OrderedListMenuItemDispatcher.js';
import LiftListItemMenuItemDispatcher from './MenuItems/LiftListItemMenuItemDispatcher.js';
import SinkListItemMenuItemDispatcher from './MenuItems/SinkListItemMenuItemDispatcher.js';
import CodeMenuItemDispatcher from './MenuItems/CodeMenuItemDispatcher.js';
import ParagraphMenuItemDispatcher from './MenuItems/ParagraphMenuItemDispatcher.js';
import BlockquoteMenuItemDispatcher from './MenuItems/BlockquoteMenuItemDispatcher.js';
import PluginInlineMenuItemDispatcher from './MenuItems/PluginInlineMenuItemDispatcher.js';
import HeadingDropdownDispatcher from './MenuItems/HeadingDropdownDispatcher.js';
import HeadingMenuItemDispatcher from './MenuItems/HeadingMenuItemDispatcher.js';
import SmileyMenuItemDispatcher from './MenuItems/SmileyMenuItemDispatcher.js';
import SmileyDropdownDispatcher from './MenuItems/SmileyDropdownDispatcher.js';
import MarkDropdownDispatcher from './MenuItems/MarkDropdownDispatcher.js';
import MarkMenuItemDispatcher from './MenuItems/MarkMenuItemDispatcher.js';
import FootnoteMenuItemDispatcher from './MenuItems/FootnoteMenuItemDispatcher.js';
import TableMenuItemDispatcher from './MenuItems/TableMenuItemDispatcher.js';
import TableDropdownDispatcher from './MenuItems/TableDropdownDispatcher.js';
import TRowAddBeforeMenuItemDispatcher from './MenuItems/TRowAddBeforeMenuItemDispatcher.js';
import TRowAddAfterMenuItemDispatcher from './MenuItems/TRowAddAfterMenuItemDispatcher.js';
import TRowDeleteMenuItemDispatcher from './MenuItems/TRowDeleteMenuItemDispatcher.js';
import TColumnAddBeforeMenuItemDispatcher from './MenuItems/TColumnAddBeforeMenuItemDispatcher.js';
import TColumnAddAfterMenuItemDispatcher from './MenuItems/TColumnAddAfterMenuItemDispatcher.js';
import TColumnDeleteMenuItemDispatcher from './MenuItems/TColumnDeleteMenuItemDispatcher.js';
import TCellHeaderMenuItemDispatcher from './MenuItems/TCellHeaderMenuItemDispatcher.js';
import TCellMergeMenuItemDispatcher from './MenuItems/TCellMergeMenuItemDispatcher.js';
import TCellSplitMenuItemDispatcher from './MenuItems/TCellSplitMenuItemDispatcher.js';
import TRemoveMenuItemDispatcher from './MenuItems/TRemoveMenuItemDispatcher.js';
import TCellAlignMenuItemDispatcher from './MenuItems/TCellAlignMenuItemDispatcher.js';
import PageMacroDropdownDispatcher from './MenuItems/PageMacroDropdownDispatcher.js';
import PageMacroMenuItemDispatcher from './MenuItems/PageMacroMenuItemDispatcher.js';
import UndoMenuItemDispatcher from './MenuItems/UndoMenuItemDispatcher.js';
import RedoMenuItemDispatcher from './MenuItems/RedoMenuItemDispatcher.js';
import SmileyConf from '../../custom/SmileyConf.js';

class MenuInitializer {
    constructor(schema) {
        this.schema = schema;
    }

    getMenuPlugin() {
        return MenuPlugin(
            this.collectMenuItems().map(item => item.getMenuItem(this.schema)),
        );
    }

    collectMenuItems() {
        const lang = LANG.plugins.prosemirror;

        const smileys = SmileyConf.getSmileys();
        const smileyItems = Object.keys(smileys)
            .map(smiley => new SmileyMenuItemDispatcher(smileys[smiley], smiley));

        return [
            new MarkDropdownDispatcher([
                new MarkMenuItemDispatcher('strong', 'format-bold', lang['label:strong']),
                new MarkMenuItemDispatcher('em', 'format-italic', lang['label:em']),
                new MarkMenuItemDispatcher('underline', 'format-underline', lang['label:underline']),
                new MarkMenuItemDispatcher('superscript', 'format-superscript', lang['label:superscript']),
                new MarkMenuItemDispatcher('subscript', 'format-subscript', lang['label:subscript']),
                new MarkMenuItemDispatcher('deleted', 'format-strikethrough', lang['label:deleted']),
                new MarkMenuItemDispatcher('code', 'console-line', lang['label:monospaced']),
                new MarkMenuItemDispatcher('unformatted', 'translate-off', lang['label:unformatted']),
            ]),
            LinkMenuItemDispatcher,
            ImageMenuItemDispatcher,
            BulletListMenuItemDispatcher,
            OrderedListMenuItemDispatcher,
            LiftListItemMenuItemDispatcher,
            SinkListItemMenuItemDispatcher,
            UndoMenuItemDispatcher,
            RedoMenuItemDispatcher,
            CodeMenuItemDispatcher,
            ParagraphMenuItemDispatcher,
            BlockquoteMenuItemDispatcher,
            FootnoteMenuItemDispatcher,
            RSSMenuItemDispatcher,
            new SmileyDropdownDispatcher(smileyItems),
            new HeadingDropdownDispatcher([
                new HeadingMenuItemDispatcher(1),
                new HeadingMenuItemDispatcher(2), // eslint-disable-line no-magic-numbers
                new HeadingMenuItemDispatcher(3), // eslint-disable-line no-magic-numbers
                new HeadingMenuItemDispatcher(4), // eslint-disable-line no-magic-numbers
                new HeadingMenuItemDispatcher(5), // eslint-disable-line no-magic-numbers
            ]),
            TableMenuItemDispatcher,
            new TableDropdownDispatcher([
                TRowAddBeforeMenuItemDispatcher,
                TRowAddAfterMenuItemDispatcher,
                TRowDeleteMenuItemDispatcher,
                TColumnAddBeforeMenuItemDispatcher,
                TColumnAddAfterMenuItemDispatcher,
                TColumnDeleteMenuItemDispatcher,
                TCellHeaderMenuItemDispatcher,
                new TCellAlignMenuItemDispatcher('left'),
                new TCellAlignMenuItemDispatcher('center'),
                new TCellAlignMenuItemDispatcher('right'),
                TCellMergeMenuItemDispatcher,
                TCellSplitMenuItemDispatcher,
                TRemoveMenuItemDispatcher,
            ]),
            new PluginDropdownDispatcher([
                PluginBlockMenuItemDispatcher,
                PluginInlineMenuItemDispatcher,
                ...window.Prosemirror.pluginMenuItemDispatchers,
            ]),
            new PageMacroDropdownDispatcher([
                new PageMacroMenuItemDispatcher('NOCACHE'),
                new PageMacroMenuItemDispatcher('NOTOC'),
            ]),
        ].filter(itemDispatcher => itemDispatcher.isAvailable(this.schema));
    }
}

export default MenuInitializer;
