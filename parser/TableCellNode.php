<?php

namespace dokuwiki\plugin\prosemirror\parser;

class TableCellNode extends Node
{
    protected $data;

    /** @var Node[] */
    protected $subnodes;

    public function __construct($data, ?Node $parent = null)
    {
        if (empty($data['content'])) {
            $data['content'] = [
                [
                    'type' => 'text',
                    'text' => ' ',
                ]
            ];
        }
        $this->data = $data;

        $previousNode = null;
        foreach ($data['content'] as $nodeData) {
            try {
                $newNode = static::getSubNode($nodeData, $this, $previousNode);
            } catch (\Throwable $e) {
                var_dump($nodeData);
                throw $e;
            }
            $this->subnodes[] = $newNode;
            $previousNode = $newNode;
        }
    }

    /**
     * Get the wiki syntax of the cell
     *
     * @return string
     */
    public function toSyntax()
    {
        $prefix = $this->isHeaderCell() ? '^' : '|';
        [$paddingLeft, $paddingRight] = $this->calculateAlignmentPadding();
        return $prefix . $paddingLeft . $this->getContentSyntax() . $paddingRight;
    }

    /**
     * Get the wiki syntax of the cell content, without separators and alignment padding
     *
     * A DokuWiki table cell holds a single line, but the editor allows several paragraphs in a cell, e.g. after
     * pasting. Each boundary between paragraphs is saved as a hard break. The editor shows paragraphs in cells
     * without margins (style.less), so the saved cell looks like it did in the editor. A cell with only empty
     * paragraphs stays empty.
     *
     * @return string
     */
    protected function getContentSyntax()
    {
        $doc = '';
        $isEmpty = true;
        $previousNode = null;
        foreach ($this->subnodes as $subnode) {
            $syntax = $subnode->toSyntax();
            if ($subnode instanceof ParagraphNode) {
                $syntax = trim($syntax);
                if ($previousNode instanceof ParagraphNode) {
                    $doc = $this->addSpaceAfterHardBreak($doc) . '\\\\ ';
                }
            }
            $doc .= $syntax;
            $isEmpty = $isEmpty && trim($syntax) === '';
            $previousNode = $subnode;
        }
        if ($isEmpty) {
            return '';
        }
        return $this->addSpaceAfterHardBreak(trim($doc));
    }

    /**
     * Add a space after a hard break at the end of the given syntax
     *
     * DokuWiki parses a hard break only if a space follows, and the break consumes that space. Without the
     * extra space, a following hard break is not parsed, and at the end of a cell the break consumes the
     * alignment padding: `|  a\\  |` is right aligned, not centered.
     *
     * @param string $syntax
     * @return string
     */
    protected function addSpaceAfterHardBreak($syntax)
    {
        if (str_ends_with($syntax, '\\\\')) {
            $syntax .= ' ';
        }
        return $syntax;
    }

    public function isHeaderCell()
    {
        return $this->data['type'] === 'table_header';
    }

    public function getRowSpan()
    {
        return $this->data['attrs']['rowspan'];
    }

    public function getColSpan()
    {
        return $this->data['attrs']['colspan'];
    }

    /**
     * Calculate the correct padding to align cell-content left, right or center
     *
     * @return String[] [left padding, right padding]
     */
    protected function calculateAlignmentPadding()
    {
        if (empty($this->data['attrs']['align'])) {
            return [' ', ' '];
        }
        if ($this->data['attrs']['align'] === 'right') {
            return ['  ', ' '];
        }
        if ($this->data['attrs']['align'] === 'center') {
            return ['  ', '  '];
        }
        if ($this->data['attrs']['align'] === 'left') {
            return [' ', '  '];
        }
        return [' ', ' '];
    }
}
