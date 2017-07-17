<?php

namespace dokuwiki\plugin\prosemirror\parser;

class InterwikiLinkNode extends Node implements InlineNodeInterface {

    /** @var  InlineNodeInterface */
    public $previous = null;

    /** @var  Node */
    protected $parent;

    protected $attrs = [];

    protected $textNode = null;

    public function __construct($data, $parent, $previousNode = false) {
        $this->parent = &$parent;
        if ($previousNode !== false) {
            $this->previous = &$previousNode;
        }

        $this->attrs = $data['attrs'];

        if (count($data['content']) !== 1) {
            throw new \InvalidArgumentException('An InterwikiLinkNode should contain exactly one TextNode');
        }

        $this->textNode = new TextNode($data['content'][0], $this, $previousNode);
    }

    public function toSyntax() {
        $prefix = $this->textNode->getPrefixSyntax();

        $linkprefix = '[[';

        $inner = $this->attrs['data-shortcut'];
        $inner .= '>';
        $reference = $this->attrs['data-reference'];
        $inner .= $reference;
        $text = $this->textNode->getInnerSyntax();
        if ($text !== $reference) {
            $inner .= '|' . $text;
        }


        $linkpostfix = ']]';

        $postfix = $this->textNode->getPostfixSyntax();
        return $prefix . $linkprefix . $inner . $linkpostfix . $postfix;
    }

    /**
     * @param string $markType
     */
    public function increaseMark($markType) {
        return $this->textNode->increaseMark($markType);
    }

    public function getStartingNodeMarkScore($markType) {
        return $this->textNode->getStartingNodeMarkScore($markType);
    }
}
