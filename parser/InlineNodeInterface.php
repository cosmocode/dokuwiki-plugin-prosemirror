<?php

namespace dokuwiki\plugin\prosemirror\parser;

interface InlineNodeInterface
{

    public function __construct($data, Node $parent, Node $previous = null);

    /**
     * @param string $markType
     */
    public function increaseMark($markType);

    public function getStartingNodeMarkScore($markType);
}
