<?php

namespace dokuwiki\plugin\prosemirror\parser;

class PreformattedNode extends Node
{

    protected $parent;
    protected $data;

    public function __construct($data, Node $parent)
    {
        $this->parent = &$parent;
        $this->data = $data;
    }

    public function toSyntax()
    {
        $lines = explode("\n", $this->data['content'][0]['text']);
        $text = implode("\n  ", $lines);
        return '  ' . $text;
    }
}
