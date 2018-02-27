<?php

namespace dokuwiki\plugin\prosemirror\parser;


class TableCellNode extends Node
{

    protected $data;

    /** @var Node[] */
    protected $subnodes;

    public function __construct($data)
    {
        $this->data = $data;

        $previousNode = false;
        foreach ($data['content'] as $nodeData) {
            $newNode = new self::$nodeclass[$nodeData['type']]($nodeData, $this, $previousNode);
            $this->subnodes[] = $newNode;
            $previousNode = $newNode;
        }
    }

    public function toSyntax()
    {
        $prefix = '|';
        if ($this->data['attrs']['is_header']) {
            $prefix = '^';
        }
        $doc = '';
        foreach ($this->subnodes as $subnode) {
            $doc .= $subnode->toSyntax();
        }

        return $prefix . $doc;
    }

    public function isHeaderCell()
    {
        return $this->data['attrs']['is_header'];
    }

    public function getRowSpan()
    {
        return $this->data['attrs']['rowspan'];
    }

    public function getColSpan()
    {
        return $this->data['attrs']['colspan'];
    }
}
