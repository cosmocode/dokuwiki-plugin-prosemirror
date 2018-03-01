<?php

namespace dokuwiki\plugin\prosemirror\parser;


class ImageNode extends Node implements InlineNodeInterface
{

    /** @var  Node */
    protected $parent;

    protected $attrs = [];

    protected $textNode = null;

    public function __construct($data, $parent, $previousNode = false)
    {
        $this->parent = &$parent;
        $this->attrs = $data['attrs'];

        // every inline node needs a TextNode to track marks
        $this->textNode = new TextNode(['marks' => $data['marks']], $parent, $previousNode);
    }

    public function toSyntax()
    {
        $title = '';
        if ($this->attrs['title']) {
            $title = '|' . $this->attrs['title'];
        }

        $leftAlign = '';
        $rightAlign = '';
        if ($this->attrs['align'] === 'left') {
            $rightAlign = ' ';
        } else if ($this->attrs['align'] === 'right') {
            $leftAlign = ' ';
        } else if ($this->attrs['align'] === 'center') {
            $leftAlign = ' ';
            $rightAlign = ' ';
        }

        $query = [];
        if ($this->attrs['height']) {
            $query[] = $this->attrs['width'] . 'x' . $this->attrs['height'];
        } else if ($this->attrs['width']) {
            $query[] = $this->attrs['width'];
        }
        if ($this->attrs['linking'] && $this->attrs['linking'] !== 'details') {
            $query[] = $this->attrs['linking'];
        }
        if ($this->attrs['cache'] && $this->attrs['cache'] !== 'cache') {
            $query[] = $this->attrs['cache'];
        }

        $queryString = '';
        if (!empty($query)) {
            $queryString = '?' . implode('&', $query);
        }


        return '{{' . $leftAlign . $this->attrs['id'] . $queryString . $rightAlign . $title . '}}';
    }

    public static function render(
        \renderer_plugin_prosemirror $renderer,
        $src,
        $title = null,
        $align = null,
        $width = null,
        $height = null,
        $cache = null,
        $linking = null
    ) {
        $node = new \dokuwiki\plugin\prosemirror\schema\Node('image');

        self::addAttributes(
            $node,
            $src,
            $title,
            $align,
            $width,
            $height,
            $cache,
            $linking
        );

        foreach (array_keys($renderer->getCurrentMarks()) as $mark) {
            $node->addMark(new \dokuwiki\plugin\prosemirror\schema\Mark($mark));
        }

        $xhtmlRenderer = p_get_renderer('xhtml');
        $xhtmlRenderer->internalmedia($src, $title, $align, $width, $height, $cache, $linking);
        $initialHtml = $xhtmlRenderer->doc;
        $node->attr('data-resolvedHtml', $initialHtml);

        $renderer->addToNodestack($node);
    }

    public static function addAttributes(
        \dokuwiki\plugin\prosemirror\schema\Node $node,
        $src,
        $title = null,
        $align = null,
        $width = null,
        $height = null,
        $cache = null,
        $linking = null,
        $prefix = ''
    ) {
        $node->attr($prefix . 'src', ml($src));
        $node->attr($prefix . 'title', $title);

        $class = 'media';
        if ($align === 'right') {
            $class = 'mediaright';
        } else if ($align === 'left') {
            $class = 'medialeft';
        } else if ($align === 'center') {
            $class = 'mediacenter';
        }

        if ($cache !== null && $cache === 'cache') {
            $cache = null;
        }

        $node->attr($prefix . 'class', $class);
        $node->attr($prefix . 'align', $align);
        $node->attr($prefix . 'width', $width);
        $node->attr($prefix . 'height', $height);
        $node->attr($prefix . 'id', $src);
        $node->attr($prefix . 'cache', $cache);
        $node->attr($prefix . 'linking', $linking);
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
}
