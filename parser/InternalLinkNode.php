<?php

namespace dokuwiki\plugin\prosemirror\parser;


class InternalLinkNode extends Node
{
    /** @var  InlineNodeInterface */
    public $previous = null;

    /** @var  Node */
    protected $parent;

    protected $attrs = [];

    protected $textNode = null;

    /**
     * @inheritDoc
     */
    public function __construct($data, $parent, $previousNode = false) {
        $this->parent = &$parent;
        if ($previousNode !== false) {
            $this->previous = &$previousNode;
        }

        $this->attrs = $data['attrs'];

        if (count($data['content']) !== 1) {
            throw new \InvalidArgumentException('An InternalLinkNode should contain exactly one TextNode');
        }

        $this->textNode = new TextNode($data['content'][0], $this, $previousNode);
    }


    public function toSyntax()
    {
        $prefix = $this->textNode->getPrefixSyntax();

        $linkprefix = '[[';

        // try data attributes
        $id = $this->attrs['data-id'];
        $queryString = $this->attrs['data-query'];
        $hash = $this->attrs['data-hash'];

        // parse from url if we don't have data
        if (empty($id)) {
            $id = explode(' ', $this->attrs['title'], 2)[0];
            $href = $this->attrs['href'];
            $components = parse_url($href);
            $queryString = $components['query'];
            parse_str($queryString, $query);
            if (!empty($query['id'])) {
                $id = $query['id'];
                unset($query['id']);
            }
            $queryString = implode('&', $query);
            $hash = $components['fragment'];
        }

        $inner = $id . ($queryString ? '?' . $queryString : '') . ($hash ? '#' . $hash : '');

        $text = $this->textNode->getInnerSyntax();
        $dokuRenderer = new \Doku_Renderer();
        if ($text !== $title = $dokuRenderer->_simpleTitle($id . ($hash ? '#' . $hash : ''))) {
            $inner .= '|' . $text;
        }


        $linkpostfix = ']]';

        $postfix = $this->textNode->getPostfixSyntax();
        return $prefix . $linkprefix . $inner . $linkpostfix . $postfix;
    }
}
