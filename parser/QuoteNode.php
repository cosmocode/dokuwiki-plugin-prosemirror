<?php

namespace dokuwiki\plugin\prosemirror\parser;

class QuoteNode extends Node
{
    /** @var Node[] */
    protected $subnodes = [];

    protected $parent;

    public function __construct($data, Node $parent)
    {
        $this->parent = &$parent;

        $previousNode = null;
        foreach ($data['content'] as $nodeData) {
            try {
                $newNode = self::getSubNode($nodeData, $this, $previousNode);
            } catch (\Throwable $e) {
                error_log("************ Unknown Node type: " . $nodeData['type'] . " ************");
                throw $e;
            }
            $this->subnodes[] = $newNode;
            $previousNode = $newNode;
        }
    }

    public function toSyntax()
    {
        $doc = '>';
        $subnodes = [];
        foreach ($this->subnodes as $subnode) {
            $syntax = $subnode->toSyntax();
            // Add a space before the syntax if the subnode is not a QuoteNode.
            // Prior to Mort, the core parser was preserving the space, now we have to add it ourselves.
            if (!$subnode instanceof self) {
                $syntax = ' ' . $syntax;
            }
            $subnodes[] = $syntax;
        }
        return $doc . implode("\n>", $subnodes);
    }
}
