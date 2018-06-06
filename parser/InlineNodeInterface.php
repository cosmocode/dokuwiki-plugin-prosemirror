<?php

namespace dokuwiki\plugin\prosemirror\parser;

interface InlineNodeInterface
{

    public function __construct($data, Node $parent, Node $previous = null);

    /**
     * If this node has that mark, increase its taillength and call this method on the previous node
     *
     * @param string $markType
     *
     * @return void
     */
    public function increaseMark($markType);

    /**
     * Get the mark's taillength on the first node to which this mark applies
     *
     * @param string $markType
     *
     * @return int|null null if the mark doesn't apply to this node or the marks taillength on the first node
     */
    public function getStartingNodeMarkScore($markType);
}
