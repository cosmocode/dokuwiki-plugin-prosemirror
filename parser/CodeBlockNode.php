<?php

namespace dokuwiki\plugin\prosemirror\parser;

class CodeBlockNode extends Node {

    protected $parent;
    protected $data;

    public function __construct($data, $parent) {
        $this->parent = &$parent;
        $this->data = $data;
    }

    public function toSyntax()
    {
        return '<code>' . "\n" . $this->data['content'][0]['text'] . "\n" . '</code>';
    }
}
