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

    public function __construct($data, Node $parent, Node $previousNode = null)
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

    protected function getDefaultLinkSyntax($inner)
    {
        $title = '';
        $prefix = $this->textNode->getPrefixSyntax();
        $postfix = $this->textNode->getPostfixSyntax();

        if (!empty($this->attrs['data-name'])) {
            $title = '|' . $this->attrs['data-name'];
        } elseif (!empty($this->attrs['image-id'])) {
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

    /**
     * @param \renderer_plugin_prosemirror $renderer
     * @param string                       $linktype
     * @param string|array                 $name
     * @param array                        $additionalAttributes
     */
    protected static function renderToJSON(
        \renderer_plugin_prosemirror $renderer,
        $linktype,
        $inner,
        $name,
        $additionalAttributes = []
    ) {
        global $ID;
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
            $linkNode->attr('data-resolvedImage', self::resolveImageTitle(
                $ID,
                $name['src'],
                $name['title'],
                $name['align'],
                $name['width'],
                $name['height'],
                $name['cache']
            ));
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

    public static function resolveImageTitle($pageId, $imageId, $title = null, $align = null, $width = null,
        $height = null, $cache = null)
    {
        /** @var \Doku_Renderer_xhtml $xhtml_renderer */
        $xhtml_renderer = p_get_renderer('xhtml');
        $src = $imageId;
        if (!media_isexternal($src)) {
            resolve_mediaid(getNS($pageId), $src, $exists);
        }
        return $xhtml_renderer->_media(
            $src,
            $title ?: $imageId,
            $align,
            $width,
            $height,
            $cache
        );
    }
}
