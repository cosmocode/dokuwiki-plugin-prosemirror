<?php

namespace dokuwiki\plugin\prosemirror\parser;


class EmailLinkNode extends Node
{

    protected $data;

    public function __construct($data, $parent)
    {
        $this->data = $data;
    }

    public function toSyntax()
    {
        list(, $address) = explode(':', $this->data['attrs']['href'], 2);
        $title = '';

        if ($this->data['content'][0]['type'] === 'image') {
            $imageNode = new ImageNode($this->data['content'][0], $this);
            $title = '|' . $imageNode->toSyntax();
        } else {
            if ($address !== $this->data['content'][0]['text']) {
                $title = '|' . $this->data['content'][0]['text'];
            }
        }

        return '[[' . $address . $title . ']]';
    }
}
