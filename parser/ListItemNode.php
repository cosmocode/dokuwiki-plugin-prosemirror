<?php
/**
 * Created by IntelliJ IDEA.
 * User: michael
 * Date: 7/7/17
 * Time: 4:10 PM
 */

namespace dokuwiki\plugin\prosemirror\parser;


class ListItemNode extends Node {

    protected $parent;
    /** @var Node[] */
    protected $subnodes = [];

    /**
     * ListItemNode constructor.
     *
     * @param          $data
     * @param ListNode $parent
     */
    public function __construct($data, $parent) {
        $this->parent = &$parent;

        foreach ($data['content'] as $node) {
            $this->subnodes[] = new self::$nodeclass[$node['type']]($node, $this);
        }

    }

    public function toSyntax() {
        $lines = [];
        foreach ($this->subnodes as $node) {
            $lines[] = $node->toSyntax();
        }
        return implode("\n", $lines);
    }

    public function getDepth()
    {
        return $this->parent->getDepth();
    }
}
