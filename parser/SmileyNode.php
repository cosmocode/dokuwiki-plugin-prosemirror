<?php

namespace dokuwiki\plugin\prosemirror\parser;


class SmileyNode extends Node implements InlineNodeInterface
{

    protected $parent;
    protected $data;

    /** @var TextNode */
    protected $textNode;

    public function __construct($data, Node $parent, Node $previous = null)
    {
        $this->parent = &$parent;
        $this->data = $data;

        // every inline node needs a TextNode to track marks
        $this->textNode = new TextNode(['marks' => $data['marks']], $parent, $previous);
    }

    /**
     * Get the node's representation as DokuWiki Syntax
     *
     * @return string
     */
    public function toSyntax()
    {
        return $this->data['attrs']['syntax'];
    }

    /**
     * @param string $markType
     */
    public function increaseMark($markType)
    {
        return $this->textNode->increaseMark($markType);
    }

    /**
     * @param string $markType
     * @return int|null
     * @throws \Exception
     */
    public function getStartingNodeMarkScore($markType)
    {
        return $this->textNode->getStartingNodeMarkScore($markType);
    }
}
