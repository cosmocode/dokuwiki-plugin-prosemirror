<?php

namespace dokuwiki\plugin\prosemirror\parser;

abstract class Node {

    protected static $nodeclass = [
        'text' => TextNode::class,
        'paragraph' => ParagraphNode::class,
        'bullet_list' => ListNode::class,
        'ordered_list' => ListNode::class,
        'heading' => HeadingNode::class,
        'interwikilink' => InterwikiLinkNode::class,
        'internallink' => InternalLinkNode::class,
        'externallink' => ExternalLinkNode::class,
        'emaillink' => EmailLinkNode::class,
        'locallink' => LocalLinkNode::class,
        'preformatted' => PreformattedNode::class,
        'code_block' => CodeBlockNode::class,
        'image' => ImageNode::class,
        'hard_break' => HardBreakNode::class,
        'horizontal_rule' => HruleNode::class,
        'footnote' => FootnoteNode::class,
        'table' => TableNode::class,
        'table_row' => TableRowNode::class,
        'table_cell' => TableCellNode::class,
    ];

    abstract public function toSyntax();


}
