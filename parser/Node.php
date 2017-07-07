<?php

namespace dokuwiki\plugin\prosemirror\parser;

abstract class Node {

    protected static $nodeclass = [
        'text' => TextNode::class,
        'paragraph' => ParagraphNode::class,
        'bullet_list' => ListNode::class,
    ];

    abstract public function toSyntax();


}
