<?php
/**
 * Created by IntelliJ IDEA.
 * User: michael
 * Date: 7/7/17
 * Time: 1:49 PM
 */

namespace dokuwiki\plugin\prosemirror\parser;


class RootNode extends Node{

    /** @var Node[] */
    protected $subnodes = [];

    public function __construct($subnodes) {
        foreach ($subnodes as $node) {
            $this->subnodes[] = new self::$nodeclass[$node['type']]($node, $this);
        }
    }

    public function toSyntax() {
        $doc = '';
        foreach ($this->subnodes as $subnode) {
            $doc .= $subnode->toSyntax();
            $doc .= "\n\n";
        }
        return $doc;
    }
}
