<?php

namespace dokuwiki\plugin\prosemirror\parser;

class TableNode extends Node
{

    /** @var TableRowNode[] */
    protected $tableRows = [];
    protected $rowSpans = [];
    protected $numCols;

    public function __construct($data, Node $parent = null)
    {
        foreach ($data['content'] as $row) {
            $this->tableRows[] = new TableRowNode($row, $this);
        }
        $this->countColNum();
    }

    /**
     * Count the total number of columns in the table
     *
     * This method calculates the number of columns in the first row, by adding the colspan of each cell.
     * This produces the correct number columns, since the first row cannot have ommited cells due to a
     * rowspan, as every other row could have.
     *
     */
    protected function countColNum() {
        $this->numCols = $this->tableRows[0]->countCols();
    }

    /**
     * Get the total number of columns for this table
     *
     * @return int
     */
    public function getNumTableCols() {
        return $this->numCols;
    }

    public function toSyntax()
    {
        $doc = '';
        foreach ($this->tableRows as $row) {
            $doc .= $row->toSyntax() . "\n";
        }

        return $doc;
    }

    public function getRowSpans()
    {
        return $this->rowSpans;
    }

    public function setRowSpans(array $rowSpans)
    {
        $this->rowSpans = $rowSpans;
    }
}
