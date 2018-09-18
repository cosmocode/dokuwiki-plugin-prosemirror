<?php

namespace dokuwiki\plugin\prosemirror\parser;

interface NodeInterface
{
    public function __construct($data, Node $parent);

    public function toSyntax();
}
