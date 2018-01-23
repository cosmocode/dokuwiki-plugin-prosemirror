<?php

namespace dokuwiki\plugin\prosemirror\parser;


class ExternalLinkNode extends Node
{

    protected $data;

    public function __construct($data, $parent)
    {
        $this->data = $data;
    }

    public function toSyntax()
    {
        $href = $this->data['attrs']['href'];
        $title = '';
        if ($href !== $this->data['content'][0]['text']) {
            $title = '|' . $this->data['content'][0]['text'];
        }
        return '[[' . $this->data['attrs']['href'] . $title . ']]';
    }
}
