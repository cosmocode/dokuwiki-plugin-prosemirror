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

    public function __construct($data, ?Node $ignored = null)
    {
        $this->attr = $data['attrs'] ?? null;
        foreach ($data['content'] ?? [] as $node) {
            $this->subnodes[] = self::getSubNode($node, $this);
        }
    }

    public function toSyntax()
    {
        $doc = '';
        $previous = null;
        foreach ($this->subnodes as $subnode) {
            if ($previous !== null) {
                $doc = rtrim($doc) . $this->getSeparator($previous, $subnode);
            }
            $doc .= $subnode->toSyntax();
            $previous = $subnode;
        }
        if ($previous !== null) {
            $doc = rtrim($doc) . "\n\n";
        }
        $doc .= $this->getMacroSyntax();
        return $doc;
    }

    /**
     * Get the line breaks between two top-level nodes
     *
     * Blocks are separated by a blank line, except next to a horizontal rule that was written
     * without one. A rule right after a table always needs it, otherwise it isn't parsed as a rule.
     *
     * @param Node $previous
     * @param Node $next
     *
     * @return string
     */
    protected function getSeparator(Node $previous, Node $next)
    {
        if ($previous instanceof HruleNode && !$previous->hasBlankAfter()) {
            return "\n";
        }
        if ($next instanceof HruleNode && !$next->hasBlankBefore() && !$previous instanceof TableNode) {
            return "\n";
        }
        return "\n\n";
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
