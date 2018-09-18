<?php
/**
 * Created by IntelliJ IDEA.
 * User: michael
 * Date: 7/7/17
 * Time: 4:06 PM
 */

namespace dokuwiki\plugin\prosemirror\parser;

class ListNode extends Node
{

    protected $parent;
    /** @var string */
    protected $prefix;
    /** @var ListItemNode[] */
    protected $listItemNodes = [];

    protected $depth = 0;

    public function __construct($data, Node $parent)
    {
        $this->parent = &$parent;
        if (is_a($this->parent, 'dokuwiki\plugin\prosemirror\parser\ListItemNode')) {
            $this->depth = $this->parent->getDepth() + 1;
        }

        $this->prefix = $data['type'] == 'bullet_list' ? '  *' : '  -';

        foreach ($data['content'] as $listItemNode) {
            $this->listItemNodes[] = new ListItemNode($listItemNode, $this);
        }
    }

    public function toSyntax()
    {
        $doc = '';

        foreach ($this->listItemNodes as $li) {
            $liText = str_repeat('  ', $this->depth);
            $liText .= $this->prefix;
            $lines = $li->toSyntax();
            if ($lines[0] !== ' ') {
                $liText .= ' ';
            }
            $liText .= $lines . "\n";
            $doc .= $liText;
        }
        return rtrim($doc); // blocks should __not__ end with a newline, parents must handle breaks between children
    }

    public function getDepth()
    {
        return $this->depth;
    }
}
