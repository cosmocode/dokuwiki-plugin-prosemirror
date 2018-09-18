<?php

namespace dokuwiki\plugin\prosemirror\parser;


class SmileyNode extends Node
{

    protected $parent;
    protected $data;

    public function __construct($data, Node $parent)
    {
        $this->parent = &$parent;
        $this->data = $data;
    }

    /**
     * Get the node's representation as DokuWiki Syntax
     *
     * @return string
     */
    public function toSyntax()
    {
        return $this->data['attrs']['syntax'];
    }
}
