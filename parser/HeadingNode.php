<?php
/**
 * Created by IntelliJ IDEA.
 * User: michael
 * Date: 7/7/17
 * Time: 4:49 PM
 */

namespace dokuwiki\plugin\prosemirror\parser;

class HeadingNode extends Node
{

    protected $parent;
    protected $level;
    protected $text;

    public function __construct($data, Node $parent)
    {
        $this->parent = &$parent;
        $this->level = $data['attrs']['level'];
        $this->text = $data['content'][0]['text'];
    }

    public function toSyntax()
    {
        $wrapper = [
            1 => '======',
            2 => '=====',
            3 => '====',
            4 => '===',
            5 => '==',
        ];

        return $wrapper[$this->level] . ' ' . $this->text . ' ' . $wrapper[$this->level];
    }
}
