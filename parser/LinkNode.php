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

    /**
     * @param \renderer_plugin_prosemirror $renderer
     * @param string $linktype
     * @param string $href
     * @param string|array $name
     * @param string $title
     * @param string $defaultClass
     * @param array  $additionalAttributes
     */
    protected static function renderToJSON(
        \renderer_plugin_prosemirror $renderer,
        $linktype,
        $href,
        $name,
        $title,
        $defaultClass,
        $additionalAttributes = [] )
    {
        $isImage = is_array($name);
        if ($isImage) {
            $class = 'media';
        } else {
            $class = $defaultClass;
        }
        $linkNode = new \dokuwiki\plugin\prosemirror\schema\Node($linktype);
        $linkNode->attr('href', $href);
        $linkNode->attr('class', $class);
        if ($isImage) {
            ImageNode::addAttributes(
                $linkNode,
                $name['src'],
                $name['title'],
                $name['align'],
                $name['width'],
                $name['height'],
                $name['cache'],
                null,
                'image-'
            );
        } else {
            $linkNode->attr('data-name', $name);
        }
        $linkNode->attr('title', $title);
        foreach ($additionalAttributes as $attributeName => $attributeValue) {
            $linkNode->attr($attributeName, $attributeValue);
        }
        $renderer->addToNodestack($linkNode);
    }
}
