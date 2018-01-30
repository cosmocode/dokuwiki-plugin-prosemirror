<?php

namespace dokuwiki\plugin\prosemirror\parser;


abstract class LinkNode extends Node implements InlineNodeInterface {


    /** @var  InlineNodeInterface */
    public $previous = null;

    /** @var  Node */
    protected $parent;

    /** @var TextNode|ImageNode  */
    protected $contentNode = null;

    protected $attrs = [];

    public function __construct($data, $parent, $previousNode = false) {
        $this->parent = &$parent;
        if ($previousNode !== false) {
            $this->previous = &$previousNode;
        }

        $this->attrs = $data['attrs'];

        if (count($data['content']) !== 1) {
            throw new \InvalidArgumentException('An LinkNode must contain exactly one TextNode or ImageNode');
        }

        if ($data['content'][0]['type'] === 'image') {
            $this->contentNode = new ImageNode($data['content'][0], $this, $previousNode);
        } else {
            $this->contentNode = new TextNode($data['content'][0], $this, $previousNode);
        }
    }


    /**
     * @param string $markType
     */
    public function increaseMark($markType) {
        return $this->contentNode->increaseMark($markType);
    }

    public function getStartingNodeMarkScore($markType) {
        return $this->contentNode->getStartingNodeMarkScore($markType);
    }

    protected function getDefaultLinkSyntax ($inner, $defaultTitle) {
        $title = '';
        $prefix = '';
        $postfix = '';

        if (is_a($this->contentNode, ImageNode::class)) {
            $title = '|' . $this->contentNode->toSyntax();
        } else {
            $prefix = $this->contentNode->getPrefixSyntax();
            $innerSyntax = $this->contentNode->getInnerSyntax();
            if ($defaultTitle !== $innerSyntax) {
                $title = '|' . $innerSyntax;
            }

            $postfix = $this->contentNode->getPostfixSyntax();
        }

        return $prefix . '[[' . $inner . $title . ']]' . $postfix;
    }
}
