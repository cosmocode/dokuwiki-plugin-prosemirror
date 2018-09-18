<?php

namespace dokuwiki\plugin\prosemirror\parser;

class HruleNode extends Node
{

    public function toSyntax()
    {
        return '----';
    }

    /**
     * HruleNode constructor.
     *
     * This is just a horizontal rule, it doesn't have attributes or context
     *
     * @param      $data
     * @param Node $parent
     */
    public function __construct($data, Node $parent)
    {
    }
}
