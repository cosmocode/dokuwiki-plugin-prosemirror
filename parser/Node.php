<?php

namespace dokuwiki\plugin\prosemirror\parser;

use dokuwiki\Extension\Event;
use dokuwiki\plugin\prosemirror\ProsemirrorException;

abstract class Node implements NodeInterface
{
    private static $nodeclass = [
        'text' => TextNode::class,
        'paragraph' => ParagraphNode::class,
        'list_paragraph' => ParagraphNode::class,
        'bullet_list' => ListNode::class,
        'ordered_list' => ListNode::class,
        'heading' => HeadingNode::class,
        'preformatted' => PreformattedNode::class,
        'code_block' => CodeBlockNode::class,
        'blockquote' => QuoteNode::class,
        'image' => ImageNode::class,
        'hard_break' => HardBreakNode::class,
        'horizontal_rule' => HruleNode::class,
        'footnote' => FootnoteNode::class,
        'smiley' => SmileyNode::class,
        'table' => TableNode::class,
        'table_row' => TableRowNode::class,
        'table_cell' => TableCellNode::class,
        'table_header' => TableCellNode::class,
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
     * Get a Node instance of the correct type
     *
     * @param array     $node
     * @param Node      $parent
     * @param Node|null $previous
     *
     * @return Node
     */
    public static function getSubNode($node, Node $parent, Node $previous = null)
    {
        try {
            if ($node['type'] === 'link') {
                $linkType = $node['attrs']['data-type'];
                return new self::$linkClasses[$linkType]($node, $parent, $previous);
            }

            if (isset(self::$nodeclass[$node['type']])) {
                return new self::$nodeclass[$node['type']]($node, $parent, $previous);
            }
            $eventData = [
                'node' => $node,
                'parent' => $parent,
                'previous' => $previous,
                'newNode' => null,
            ];
            $event = new Event('PROSEMIRROR_PARSE_UNKNOWN', $eventData);
            if ($event->advise_before() || !is_a($eventData['newNode'], self::class)) {
                $exception = new ProsemirrorException('Invalid node type received: ' . $node['type'], 0);
                $exception->addExtraData('nodeData', $node);
                $exception->addExtraData('parentNodeType', get_class($parent));

                throw $exception;
            }
            return $eventData['newNode'];
        } catch (\Error $e) {
            $exception = new ProsemirrorException(
                'FIXME: better message for general error! Invalid node type received: ' . $node['type'],
                0,
                $e
            );
            $exception->addExtraData('nodeData', $node);
            $exception->addExtraData('parentNodeType', get_class($parent));

            throw $exception;
        }
    }

    /**
     * Get the node's representation as DokuWiki Syntax
     *
     * @return string
     */
    abstract public function toSyntax();
}
