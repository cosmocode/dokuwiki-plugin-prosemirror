<?php

namespace dokuwiki\plugin\prosemirror\parser;

class FootnoteNode extends Node
{
    /** @var TextNode[] */
    protected $subnodes = [];

    protected $parent;

    public function __construct($data, Node $parent)
    {
        $this->parent = &$parent;

        $previousNode = null;
        $json = $data['attrs']['contentJSON'];
        $contentDoc = json_decode($json, true);
        foreach ($contentDoc['content'] as $subnode) {
            $this->subnodes[] = self::getSubNode($subnode, $this);
        }
    }

    public function toSyntax()
    {
        $doc = '';
        foreach ($this->subnodes as $subnode) {
            $doc .= $subnode->toSyntax() . "\n\n";
        }
        return "((\n" . rtrim(ltrim($doc, "\n")) . "\n))";
    }
}
