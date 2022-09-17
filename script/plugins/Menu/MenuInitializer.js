import RSSMenuItemDispatcher from './MenuItems/RSSMenuItemDispatcher';
import MenuPlugin from './MenuPlugin';
import PluginDropdownDispatcher from './MenuItems/PluginDropdownDispatcher';
import PluginBlockMenuItemDispatcher from './MenuItems/PluginBlockMenuItemDispatcher';
import LinkMenuItemDispatcher from './MenuItems/LinkMenuItemDispatcher';
import ImageMenuItemDispatcher from './MenuItems/ImageMenuItemDispatcher';
import BulletListMenuItemDispatcher from './MenuItems/BulletListMenuItemDispatcher';
import OrderedListMenuItemDispatcher from './MenuItems/OrderedListMenuItemDispatcher';
import LiftListItemMenuItemDispatcher from './MenuItems/LiftListItemMenuItemDispatcher';
import SinkListItemMenuItemDispatcher from './MenuItems/SinkListItemMenuItemDispatcher';
import CodeMenuItemDispatcher from './MenuItems/CodeMenuItemDispatcher';
import ParagraphMenuItemDispatcher from './MenuItems/ParagraphMenuItemDispatcher';
import BlockquoteMenuItemDispatcher from './MenuItems/BlockquoteMenuItemDispatcher';
import PluginInlineMenuItemDispatcher from './MenuItems/PluginInlineMenuItemDispatcher';
import HeadingDropdownDispatcher from './MenuItems/HeadingDropdownDispatcher';
import HeadingMenuItemDispatcher from './MenuItems/HeadingMenuItemDispatcher';
import SmileyMenuItemDispatcher from './MenuItems/SmileyMenuItemDispatcher';
import SmileyDropdownDispatcher from './MenuItems/SmileyDropdownDispatcher';
import MarkDropdownDispatcher from './MenuItems/MarkDropdownDispatcher';
import MarkMenuItemDispatcher from './MenuItems/MarkMenuItemDispatcher';
import FootnoteMenuItemDispatcher from './MenuItems/FootnoteMenuItemDispatcher';
import TableMenuItemDispatcher from './MenuItems/TableMenuItemDispatcher';
import TableDropdownDispatcher from './MenuItems/TableDropdownDispatcher';
import TRowAddBeforeMenuItemDispatcher from './MenuItems/TRowAddBeforeMenuItemDispatcher';
import TRowAddAfterMenuItemDispatcher from './MenuItems/TRowAddAfterMenuItemDispatcher';
import TRowDeleteMenuItemDispatcher from './MenuItems/TRowDeleteMenuItemDispatcher';
import TColumnAddBeforeMenuItemDispatcher from './MenuItems/TColumnAddBeforeMenuItemDispatcher';
import TColumnAddAfterMenuItemDispatcher from './MenuItems/TColumnAddAfterMenuItemDispatcher';
import TColumnDeleteMenuItemDispatcher from './MenuItems/TColumnDeleteMenuItemDispatcher';
import TCellHeaderMenuItemDispatcher from './MenuItems/TCellHeaderMenuItemDispatcher';
import TCellMergeMenuItemDispatcher from './MenuItems/TCellMergeMenuItemDispatcher';
import TCellSplitMenuItemDispatcher from './MenuItems/TCellSplitMenuItemDispatcher';
import TRemoveMenuItemDispatcher from './MenuItems/TRemoveMenuItemDispatcher';
import TCellAlignMenuItemDispatcher from './MenuItems/TCellAlignMenuItemDispatcher';
import PageMacroDropdownDispatcher from './MenuItems/PageMacroDropdownDispatcher';
import PageMacroMenuItemDispatcher from './MenuItems/PageMacroMenuItemDispatcher';
import UndoMenuItemDispatcher from './MenuItems/UndoMenuItemDispatcher';
import RedoMenuItemDispatcher from './MenuItems/RedoMenuItemDispatcher';

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
        return [
            new MarkDropdownDispatcher([
                new MarkMenuItemDispatcher('strong', 'format-bold', lang['label:strong']),
                new MarkMenuItemDispatcher('em', 'format-italic', lang['label:em']),
                new MarkMenuItemDispatcher('underline', 'format-underline', lang['label:underline']),
                new MarkMenuItemDispatcher('superscript', 'format-superscript', lang['label:superscript']),
                new MarkMenuItemDispatcher('subscript', 'format-subscript', lang['label:subscript']),
                new MarkMenuItemDispatcher('deleted', 'format-strikethrough', lang['label:deleted']),
                new MarkMenuItemDispatcher('code', 'console-line', lang['label:monospaced']),
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
            new SmileyDropdownDispatcher([
                new SmileyMenuItemDispatcher('cool.svg', '8-)'),
                new SmileyMenuItemDispatcher('eek.svg', '8-O'),
                new SmileyMenuItemDispatcher('sad.svg', ':-('),
                new SmileyMenuItemDispatcher('smile.svg', ':-)'),
                new SmileyMenuItemDispatcher('smile2.svg', '=)'),
                new SmileyMenuItemDispatcher('doubt.svg', ':-/'),
                new SmileyMenuItemDispatcher('doubt2.svg', ':-\\'),
                new SmileyMenuItemDispatcher('confused.svg', ':-?'),
                new SmileyMenuItemDispatcher('biggrin.svg', ':-D'),
                new SmileyMenuItemDispatcher('razz.svg', ':-P'),
                new SmileyMenuItemDispatcher('surprised.svg', ':-O'),
                new SmileyMenuItemDispatcher('silenced.svg', ':-X'),
                new SmileyMenuItemDispatcher('neutral.svg', ':-|'),
                new SmileyMenuItemDispatcher('wink.svg', ';-)'),
                new SmileyMenuItemDispatcher('fun.svg', '^_^'),
                new SmileyMenuItemDispatcher('question.svg', ':?:'),
                new SmileyMenuItemDispatcher('exclaim.svg', ':!:'),
                new SmileyMenuItemDispatcher('lol.svg', 'LOL'),
                new SmileyMenuItemDispatcher('fixme.gif', 'FIXME'),
                new SmileyMenuItemDispatcher('delete.gif', 'DELETEME'),
            ]),
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
