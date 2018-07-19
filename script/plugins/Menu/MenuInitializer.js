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
        return [
            new MarkDropdownDispatcher([
                new MarkMenuItemDispatcher('strong', 'format-bold', 'strong'),
                new MarkMenuItemDispatcher('em', 'format-italic', 'em'),
                new MarkMenuItemDispatcher('underline', 'format-underline', 'underline'),
                new MarkMenuItemDispatcher('superscript', 'format-superscript', 'superscript'),
                new MarkMenuItemDispatcher('subscript', 'format-subscript', 'subscript'),
                new MarkMenuItemDispatcher('deleted', 'format-strikethrough', 'deleted'),
                new MarkMenuItemDispatcher('code', 'console-line', 'monospaced'),
            ]),
            LinkMenuItemDispatcher,
            ImageMenuItemDispatcher,
            BulletListMenuItemDispatcher,
            OrderedListMenuItemDispatcher,
            LiftListItemMenuItemDispatcher,
            SinkListItemMenuItemDispatcher,
            CodeMenuItemDispatcher,
            ParagraphMenuItemDispatcher,
            BlockquoteMenuItemDispatcher,
            RSSMenuItemDispatcher,
            new SmileyDropdownDispatcher([
                new SmileyMenuItemDispatcher('icon_cool.gif', '8-)'),
                new SmileyMenuItemDispatcher('icon_eek.gif', '8-O'),
                new SmileyMenuItemDispatcher('icon_sad.gif', ':-('),
                new SmileyMenuItemDispatcher('icon_smile.gif', ':-)'),
                new SmileyMenuItemDispatcher('icon_smile2.gif', '=)'),
                new SmileyMenuItemDispatcher('icon_doubt.gif', ':-/'),
                new SmileyMenuItemDispatcher('icon_doubt2.gif', ':-\\'),
                new SmileyMenuItemDispatcher('icon_confused.gif', ':-?'),
                new SmileyMenuItemDispatcher('icon_biggrin.gif', ':-D'),
                new SmileyMenuItemDispatcher('icon_razz.gif', ':-P'),
                new SmileyMenuItemDispatcher('icon_surprised.gif', ':-O'),
                new SmileyMenuItemDispatcher('icon_silenced.gif', ':-X'),
                new SmileyMenuItemDispatcher('icon_neutral.gif', ':-|'),
                new SmileyMenuItemDispatcher('icon_wink.gif', ';-)'),
                new SmileyMenuItemDispatcher('icon_fun.gif', '^_^'),
                new SmileyMenuItemDispatcher('icon_question.gif', ':?:'),
                new SmileyMenuItemDispatcher('icon_exclaim.gif', ':!:'),
                new SmileyMenuItemDispatcher('icon_lol.gif', 'LOL'),
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
            new PluginDropdownDispatcher([
                PluginBlockMenuItemDispatcher,
                PluginInlineMenuItemDispatcher,
                ...window.Prosemirror.pluginMenuItemDispatchers,
            ]),
        ].filter(itemDispatcher => itemDispatcher.isAvailable(this.schema));
    }
}

export default MenuInitializer;
