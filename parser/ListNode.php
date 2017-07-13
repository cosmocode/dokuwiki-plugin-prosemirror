<?php
/**
 * Created by IntelliJ IDEA.
 * User: michael
 * Date: 7/7/17
 * Time: 4:06 PM
 */

namespace dokuwiki\plugin\prosemirror\parser;


class ListNode extends Node {

    protected $parent;
    /** @var string  */
    protected $prefix;
    /** @var ListItemNode[] */
    protected $listItemNodes = [];

    public function __construct($data, $parent) {
        $this->parent = &$parent;
        $this->prefix = $data['type'] == 'bullet_list' ? '  *' : '  -';

        foreach ($data['content'] as $listItemNode) {
            $this->listItemNodes[] = new ListItemNode($listItemNode, $this);
        }
    }

    public function toSyntax() {
        $doc = '';

        foreach ($this->listItemNodes as $li) {
            $liText = $this->prefix;
            $lines = explode("\n", $li->toSyntax());
            if ($lines[0][0] !== ' ') {
                $liText .= ' ';
            }
            $liText .= array_shift($lines);
            $liText .= "\n";
            foreach ($lines as $subListLine) {
                $liText .= '  ' . $subListLine . "\n";
            }

            $doc .= $liText;
        }
        return rtrim($doc); // blocks should __not__ end with a newline, parents must handle breaks between children
    }
}
