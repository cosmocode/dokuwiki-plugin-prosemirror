<?php

namespace dokuwiki\plugin\prosemirror\parser;


abstract class LinkNode extends Node implements InlineNodeInterface
{


    /** @var  InlineNodeInterface */
    public $previous = null;

    /** @var  Node */
    protected $parent;

    /** @var TextNode */
    protected $textNode = null;

    protected $attrs = [];

    public function __construct($data, $parent, $previousNode = false)
    {
        $this->parent = &$parent;
        if ($previousNode !== false) {
            $this->previous = &$previousNode;
        }

        $this->attrs = $data['attrs'];

        // every inline node needs a TextNode to track marks
        $this->textNode = new TextNode(['marks' => $data['marks']], $parent, $previousNode);
    }


    /**
     * @param string $markType
     */
    public function increaseMark($markType)
    {
        return $this->textNode->increaseMark($markType);
    }

    public function getStartingNodeMarkScore($markType)
    {
        return $this->textNode->getStartingNodeMarkScore($markType);
    }

    protected function getDefaultLinkSyntax2($inner)
    {
        $title = '';
        $prefix = $this->textNode->getPrefixSyntax();;
        $postfix = $this->textNode->getPostfixSyntax();

        if (!empty($this->attrs['data-name'])) {
            $title = '|' . $this->attrs['data-name'];
        } else if (!empty($this->attrs['image-src'])) {
            $imageAttrs = [];
            foreach ($this->attrs as $key => $value) {
                @list ($keyPrefix, $attrKey) = explode('-', $key, 2);
                if ($keyPrefix === 'image') {
                    $imageAttrs[$attrKey] = $value;
                }
            }
            $imageNode = new ImageNode([
                'attrs' => $imageAttrs,
                'marks' => [],
            ], $this);
            $title = '|' . $imageNode->toSyntax();
        }

        return $prefix . '[[' . $inner . $title . ']]' . $postfix;
    }


    protected function getDefaultLinkSyntax($inner, $defaultTitle)
    {
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

    protected static function renderToJSON2(
        \renderer_plugin_prosemirror $renderer,
        $linktype,
        $inner,
        $name,
        $additionalAttributes = []
    ) {
        $isImage = is_array($name);
        $linkNode = new \dokuwiki\plugin\prosemirror\schema\Node('link');
        $linkNode->attr('data-type', $linktype);
        $linkNode->attr('data-inner', $inner);
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
        foreach ($additionalAttributes as $attributeName => $attributeValue) {
            $linkNode->attr($attributeName, $attributeValue);
        }
        foreach (array_keys($renderer->getCurrentMarks()) as $mark) {
            $linkNode->addMark(new \dokuwiki\plugin\prosemirror\schema\Mark($mark));
        }
        $renderer->addToNodestack($linkNode);
    }

    /**
     * @param \renderer_plugin_prosemirror $renderer
     * @param string $linktype
     * @param string $href
     * @param string|array $name
     * @param string $title
     * @param string $defaultClass
     * @param array $additionalAttributes
     */
    protected static function renderToJSON(
        \renderer_plugin_prosemirror $renderer,
        $linktype,
        $href,
        $name,
        $title,
        $defaultClass,
        $additionalAttributes = []
    ) {
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
        foreach (array_keys($renderer->getCurrentMarks()) as $mark) {
            $linkNode->addMark(new \dokuwiki\plugin\prosemirror\schema\Mark($mark));
        }
        $renderer->addToNodestack($linkNode);
    }
}
