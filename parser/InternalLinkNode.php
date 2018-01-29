<?php

namespace dokuwiki\plugin\prosemirror\parser;


class InternalLinkNode extends Node
{
    /** @var  InlineNodeInterface */
    public $previous = null;

    /** @var  Node */
    protected $parent;

    protected $attrs = [];

    protected $content = null;

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
        if ($data['content'][0]['type'] === 'image') {
            $this->content = new ImageNode($data['content'][0], $this);
        } else {
            $this->content = new TextNode($data['content'][0], $this, $previousNode);
        }
    }


    public function toSyntax()
    {

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

        if (is_a($this->content, ImageNode::class)) {
            $prefix = '';
            $inner .= '|' . $this->content->toSyntax();
            $postfix = '';
        } else {
            $prefix = $this->content->getPrefixSyntax();
            $text = $this->content->getInnerSyntax();
            $dokuRenderer = new \Doku_Renderer();
            if ($text !== $title = $dokuRenderer->_simpleTitle($id . ($hash ? '#' . $hash : ''))) {
                $inner .= '|' . $text;
            }
            $postfix = $this->content->getPostfixSyntax();
        }


        $linkpostfix = ']]';

        return $prefix . $linkprefix . $inner . $linkpostfix . $postfix;
    }
}
