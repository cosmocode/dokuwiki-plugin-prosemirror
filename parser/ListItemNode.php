<?php
/**
 * Created by IntelliJ IDEA.
 * User: michael
 * Date: 7/7/17
 * Time: 4:10 PM
 */

namespace dokuwiki\plugin\prosemirror\parser;

class ListItemNode extends Node
{

    protected $parent;
    /** @var Node[] */
    protected $subnodes = [];

    /**
     * ListItemNode constructor.
     *
     * @param          $data
     * @param ListNode $parent
     */
    public function __construct($data, Node $parent)
    {
        $this->parent = &$parent;

        foreach ($data['content'] as $node) {
            if ($node['type'] === 'list_content') {
                foreach ($node['content'] as $subnode) {
                    $this->subnodes[] = self::getSubNode($subnode, $this);
                }
                continue;
            }

            $this->subnodes[] = self::getSubNode($node, $this);
        }
    }

    public function toSyntax()
    {
        $lines = [];
        foreach ($this->subnodes as $node) {
            /*
             * only sublists may start with a linebreak, other blocks, like <code> must not have a linebreak before them
             * or DokuWiki will interprete this as a new block altogether, instead as something that is part of the
             * current <li>
             */
            $prefixLinebreak = '';
            if (is_a($node, ListNode::class)) {
                $prefixLinebreak = "\n";
            }
            $lines[] = $prefixLinebreak . $node->toSyntax();
        }
        return implode("", $lines);
    }

    public function getDepth()
    {
        return $this->parent->getDepth();
    }
}
