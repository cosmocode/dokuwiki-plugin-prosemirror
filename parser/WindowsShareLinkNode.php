<?php

namespace dokuwiki\plugin\prosemirror\parser;


class WindowsShareLinkNode extends Node
{
    protected $data;

    public function __construct($data, $parent)
    {
        $this->data = $data;
    }

    public function toSyntax()
    {
        $url = $this->data['attrs']['href'];
        $url = substr($url, strlen('file:///'));
        $url = str_replace('/', '\\', $url);
        $title = '';

        if ($this->data['content'][0]['type'] === 'image') {
            $imageNode = new ImageNode($this->data['content'][0], $this);
            $title = '|' . $imageNode->toSyntax();
        } else {
            if ($url !== $this->data['content'][0]['text']) {
                $title = '|' . $this->data['content'][0]['text'];
            }
        }

        return '[[' . $url . $title . ']]';
    }
}
