<?php

namespace dokuwiki\plugin\prosemirror\parser;


class PluginNode extends Node
{

    protected $data;

    public function __construct($data, $parent) {
        $this->data = $data;
    }

    public function toSyntax() {
        return $this->data['content'];
    }
}
