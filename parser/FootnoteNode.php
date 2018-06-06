<?php
/**
 * Created by IntelliJ IDEA.
 * User: michael
 * Date: 1/25/18
 * Time: 2:40 PM
 */

namespace dokuwiki\plugin\prosemirror\parser;

class FootnoteNode extends Node
{
    /** @var TextNode[] */
    protected $subnodes = [];

    protected $parent;

    public function __construct($data, $parent)
    {
        $this->parent = &$parent;

        $previousNode = null;
        foreach ($data['content'] as $nodeData) {
            $newNode = self::getSubNode($nodeData, $this, $previousNode);
            $this->subnodes[] = $newNode;
            $previousNode = $newNode;
        }
    }

    public function toSyntax()
    {
        $doc = '';
        foreach ($this->subnodes as $subnode) {
            $doc .= $subnode->toSyntax();
        }
        return '((' . $doc . '))';
    }
}
