<?php

namespace dokuwiki\plugin\prosemirror\parser;

class TableRowNode extends Node
{

    /** @var TableCellNode[] */
    protected $tableCells = [];

    /** @var TableNode */
    protected $parent;

    public function __construct($data, Node $parent)
    {
        $this->parent = $parent;
        foreach ($data['content'] as $cell) {
            $this->tableCells[] = new TableCellNode($cell);
        }
    }

    public function toSyntax()
    {
        $doc = '';
        $rowSpans = $this->parent->getRowSpans();
        $numColsInTable = $this->parent->getNumTableCols();
        $lastCell = end($this->tableCells);
        for ($colIndex = 1; $colIndex <= $numColsInTable; $colIndex += $colSpan) {
            if (!empty($rowSpans[$colIndex])) {
                $doc .= '| ::: ';
                $rowSpans[$colIndex] -= 1;
                $colspan = 1;
                continue;
            }
            $tableCell = array_shift($this->tableCells);
            $doc .= $tableCell->toSyntax();

            $rowSpan = $tableCell->getRowSpan();
            $colSpan = $tableCell->getColSpan();
            // does nothing if $rowSpan==1 and $colSpan==1
            for ($colSpanIndex = 0; $colSpanIndex < $colSpan; $colSpanIndex += 1) {
                $rowSpans[$colIndex + $colSpanIndex] = $rowSpan - 1;
            }

            $doc .= str_repeat('|', $colSpan - 1);

        }
        $this->parent->setRowSpans($rowSpans);

        $postfix = $lastCell->isHeaderCell() ? '^' : '|';

        return $doc . $postfix;
    }

    /**
     * This counts the number of columns covered by the cells in the current row
     *
     * WARNING: This will not(!) count cells ommited due to row-spans!
     *
     * @return int
     */
    public function countCols() {
        $cols = 0;
        foreach ($this->tableCells as $cell) {
            $cols += $cell->getColSpan();
        }
        return $cols;
    }
}
