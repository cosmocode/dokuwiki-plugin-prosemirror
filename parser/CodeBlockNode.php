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
        $tagname = $this->data['type'] === 'code_block' ? 'code' : 'file';
        $openingTag = '<' . $tagname;
        if (!empty($this->data['attrs']['data-language'])) {
            $openingTag .= ' ' . $this->data['attrs']['data-language'];
        } else {
            $openingTag .= ' -';
        }
        if (!empty($this->data['attrs']['data-filename'])) {
            $openingTag .= ' ' . $this->data['attrs']['data-filename'];
        }
        $openingTag .= '>';
        return $openingTag . "\n" . $this->data['content'][0]['text'] . "\n</$tagname>";
    }
}
