<?php

namespace dokuwiki\plugin\prosemirror\parser;

class QuoteNode extends Node
{
    /** @var Node[] */
    protected $subnodes = [];

    protected $parent;

    public function __construct($data, $parent)
    {
        $this->parent = &$parent;

        $previousNode = false;
        foreach ($data['content'] as $nodeData) {
            try {
                $newNode = new self::$nodeclass[$nodeData['type']]($nodeData, $this, $previousNode);
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
        foreach ($this->subnodes as $subnode) {
            $doc .= $subnode->toSyntax();
        }
        return $doc;
    }
}
