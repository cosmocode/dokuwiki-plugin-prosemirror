<?php

namespace dokuwiki\plugin\prosemirror\parser;

interface InlineNodeInterface {

    public function __construct($data, $parent, $previous = false);

    /**
     * @param string $markType
     */
    public function increaseMark($markType);

    public function getStartingNodeMarkScore($markType);
}
