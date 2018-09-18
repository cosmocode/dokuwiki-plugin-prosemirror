<?php
/**
 * Created by IntelliJ IDEA.
 * User: michael
 * Date: 7/7/17
 * Time: 1:49 PM
 */

namespace dokuwiki\plugin\prosemirror\parser;

class RootNode extends Node
{

    /** @var Node[] */
    protected $subnodes = [];

    protected $attr = [];

    public function __construct($data, Node $ignored = null)
    {
        $this->attr = $data['attrs'];
        foreach ($data['content'] as $node) {
            $this->subnodes[] = self::getSubNode($node, $this);
        }
    }

    public function toSyntax()
    {
        $doc = '';
        foreach ($this->subnodes as $subnode) {
            $doc .= $subnode->toSyntax();
            $doc = rtrim($doc);
            $doc .= "\n\n";
        }
        $doc .= $this->getMacroSyntax();
        return $doc;
    }

    /**
     * Get the syntax for each active macro
     *
     * This produces the syntax representation for the and NOCACHE NOTOC macros
     *
     * @return string empty string or a string with a line for each active macro
     */
    protected function getMacroSyntax()
    {
        $syntax = '';
        if (!empty($this->attr['nocache'])) {
            $syntax .= "~~NOCACHE~~\n";
        }
        if (!empty($this->attr['notoc'])) {
            $syntax .= "~~NOTOC~~\n";
        }
        return $syntax;
    }
}
