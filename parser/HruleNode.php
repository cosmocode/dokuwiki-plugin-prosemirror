<?php

namespace dokuwiki\plugin\prosemirror\parser;

/**
 * Horizontal rule, saved as it was written
 *
 * Core accepts 4 or more dashes, and with Markdown syntax enabled also 3 or more of `-`, `*` or `_`
 * (`$conf['syntax']`, see dokuwiki\Parsing\ParserMode\GfmHr). The editor doesn't convert between
 * DokuWiki and Markdown syntax yet, so it keeps the markup it was given and uses `----`, valid with
 * every setting, for new rules.
 */
class HruleNode extends Node
{
    /** @var string the markup of new rules, valid with every syntax setting */
    public const DEFAULT_MARKUP = '----';

    /** @var string the rule as written */
    protected $markup;

    /** @var bool whether a blank line precedes the rule in the syntax */
    protected $blankBefore;

    /** @var bool whether a blank line follows the rule in the syntax */
    protected $blankAfter;

    /**
     * HruleNode constructor.
     *
     * @param array $data
     * @param Node $parent
     */
    public function __construct($data, Node $parent)
    {
        $this->markup = $data['attrs']['markup'] ?? self::DEFAULT_MARKUP;
        $this->blankBefore = $data['attrs']['blankBefore'] ?? true;
        $this->blankAfter = $data['attrs']['blankAfter'] ?? true;
    }

    /** @inheritDoc */
    public function toSyntax()
    {
        return $this->markup;
    }

    /**
     * @return bool whether a blank line precedes the rule in the syntax
     */
    public function hasBlankBefore()
    {
        return $this->blankBefore;
    }

    /**
     * @return bool whether a blank line follows the rule in the syntax
     */
    public function hasBlankAfter()
    {
        return $this->blankAfter;
    }
}
