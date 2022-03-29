<?php
/**
 * Created by IntelliJ IDEA.
 * User: michael
 * Date: 1/25/18
 * Time: 11:15 AM
 */

namespace dokuwiki\plugin\prosemirror\parser;

class HardBreakNode extends Node implements InlineNodeInterface
{
    /** @var TextNode */
    protected $textNode;

    /**
     * HardBreakNode constructor.
     *
     * This is just a hard break, it doesn't have attributes or context
     *
     * @param      $data
     * @param Node $parent
     * @param Node|null $previous
     */
    public function __construct($data, Node $parent, Node $previous = null)
    {
        // every inline node needs a TextNode to track marks
        $this->textNode = new TextNode(['marks' => $data['marks'] ?? null], $parent, $previous);
    }

    public function toSyntax()
    {
        return '\\\\ ';
    }

    /**
     * @param string $markType
     */
    public function increaseMark($markType)
    {
        $this->textNode->increaseMark($markType);
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
