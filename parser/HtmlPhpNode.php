<?php

namespace dokuwiki\plugin\prosemirror\parser;

class HtmlPhpNode extends Node
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
        switch ($this->data['type']) {
            case 'html_inline':
                {
                    $tagname = 'html';
                    $blockLinebreak = '';
                    break;
                }
            case 'html_block':
                {
                    $tagname = 'HTML';
                    $blockLinebreak = "\n";
                    break;
                }
            case 'php_inline':
                {
                    $tagname = 'php';
                    $blockLinebreak = '';
                    break;
                }
            case 'php_block':
                {
                    $tagname = 'PHP';
                    $blockLinebreak = "\n";
                    break;
                }
        }

        return "<$tagname>$blockLinebreak" . $this->data['content'][0]['text'] . "$blockLinebreak</$tagname>";
    }
}
