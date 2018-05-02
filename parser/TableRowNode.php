<?php

namespace dokuwiki\plugin\prosemirror\parser;

class TableRowNode extends Node
{

    /** @var TableCellNode[] */
    protected $tableCells = [];

    /** @var TableNode */
    protected $parent;

    public function __construct($data, TableNode $parent)
    {
        $this->parent = $parent;
        foreach ($data['content'] as $cell) {
            $this->tableCells[] = new TableCellNode($cell);
        }
    }

    public function toSyntax()
    {
        $doc = '';
        $colIndex = 0;
        $rowSpans = $this->parent->getRowSpans();
        foreach ($this->tableCells as $tableCell) {
            $colIndex += 1;

            while (!empty($rowSpans[$colIndex])) {
                $doc .= '| ::: ';
                $rowSpans[$colIndex] -= 1;
                $colIndex += 1;
            }

            $doc .= $tableCell->toSyntax();

            // does nothing if $rowSpan==1 and $colSpan==1
            $rowSpan = $tableCell->getRowSpan();
            $colSpan = $tableCell->getColSpan();
            for ($i = 0; $i < $colSpan; $i += 1) {
                $rowSpans[$colIndex + $i] = $rowSpan - 1;
            }
            $doc .= str_repeat('|', $colSpan - 1);
            $colIndex += $colSpan - 1;
        }

        $this->parent->setRowSpans($rowSpans);

        $lastCell = end($this->tableCells);
        $postfix = $lastCell->isHeaderCell() ? '^' : '|';

        return $doc . $postfix;
    }
}
