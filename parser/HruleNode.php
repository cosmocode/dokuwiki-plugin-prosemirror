<?php

namespace dokuwiki\plugin\prosemirror\parser;

class HruleNode extends Node
{

    public function toSyntax()
    {
        return '----';
    }
}
