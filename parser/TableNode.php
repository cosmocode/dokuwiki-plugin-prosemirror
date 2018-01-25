<?php

namespace dokuwiki\plugin\prosemirror\parser;


class TableNode extends Node
{

    /** @var TableRowNode[] */
    protected $tableRows = [];
    protected $rowSpans = [];

    public function __construct($data)
    {
        foreach ($data['content'] as $row) {
            $this->tableRows[] = new TableRowNode($row, $this);
        }
    }

    public function toSyntax()
    {
        $doc = '';
        foreach ($this->tableRows as $row) {
            $doc .= $row->toSyntax() . "\n";
        }

        return $doc;
    }

    public function getRowSpans() {
        return $this->rowSpans;
    }

    public function setRowSpans(array $rowSpans) {
        $this->rowSpans = $rowSpans;
    }

}
