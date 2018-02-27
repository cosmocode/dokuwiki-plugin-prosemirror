<?php

namespace dokuwiki\plugin\prosemirror\parser;


class ParagraphNode extends Node
{

    /** @var TextNode[] */
    protected $subnodes = [];

    protected $parent;

    public function __construct($data, $parent)
    {
        $this->parent = &$parent;

        $previousNode = false;
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
        return $doc;
    }
}
