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
            $subnodes[] = $subnode->toSyntax();
        }
        return $doc . implode("\n>", $subnodes);
    }
}
