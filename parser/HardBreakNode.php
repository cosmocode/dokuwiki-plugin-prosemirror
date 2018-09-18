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
    /**
     * HardBreakNode constructor.
     *
     * This is just a hard break, it doesn't have attributes or context
     *
     * @param      $data
     * @param Node $parent
     */
    public function __construct($data, Node $parent)
    {
    }

    public function toSyntax()
    {
        return '\\\\ ';
    }
}
