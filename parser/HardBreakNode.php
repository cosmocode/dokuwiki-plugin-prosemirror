<?php
/**
 * Created by IntelliJ IDEA.
 * User: michael
 * Date: 1/25/18
 * Time: 11:15 AM
 */

namespace dokuwiki\plugin\prosemirror\parser;


class HardBreakNode extends Node
{

    public function toSyntax()
    {
        return '\\\\ ';
    }
}
