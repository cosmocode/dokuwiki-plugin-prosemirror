<?php

namespace dokuwiki\plugin\prosemirror\parser;

abstract class Node
{

    private static $nodeclass = [
        'text' => TextNode::class,
        'paragraph' => ParagraphNode::class,
        'bullet_list' => ListNode::class,
        'ordered_list' => ListNode::class,
        'heading' => HeadingNode::class,
        'preformatted' => PreformattedNode::class,
        'code_block' => CodeBlockNode::class,
        'file_block' => CodeBlockNode::class,
        'html_inline' => HtmlPhpNode::class,
        'html_block' => HtmlPhpNode::class,
        'php_inline' => HtmlPhpNode::class,
        'php_block' => HtmlPhpNode::class,
        'quote' => QuoteNode::class,
        'image' => ImageNode::class,
        'hard_break' => HardBreakNode::class,
        'horizontal_rule' => HruleNode::class,
        'footnote' => FootnoteNode::class,
        'table' => TableNode::class,
        'table_row' => TableRowNode::class,
        'table_cell' => TableCellNode::class,
        'rss' => RSSNode::class,
        'dwplugin_inline' => PluginNode::class,
        'dwplugin_block' => PluginNode::class,
    ];


    private static $linkClasses = [
        'interwikilink' => InterwikiLinkNode::class,
        'internallink' => InternalLinkNode::class,
        'emaillink' => EmailLinkNode::class,
        'externallink' => ExternalLinkNode::class,
        'windowssharelink' => WindowsShareLinkNode::class,
        'other' => ExternalLinkNode::class,
    ];

    /**
     * @param array     $node
     * @param Node      $parent
     * @param Node|null $previous
     *
     * @return Node
     */
    public static function getSubNode($node, Node $parent, Node $previous = null)
    {
        if ($node['type'] === 'link') {
            $linkType = $node['attrs']['data-type'];
            return new self::$linkClasses[$linkType]($node, $parent, $previous);
        }

        return new self::$nodeclass[$node['type']]($node, $parent, $previous);
    }

    /**
     * Get the node's representation as DokuWiki Syntax
     *
     * @return string
     */
    abstract public function toSyntax();
}
