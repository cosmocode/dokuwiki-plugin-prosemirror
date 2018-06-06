<?php

namespace dokuwiki\plugin\prosemirror\parser;

class ImageNode extends Node implements InlineNodeInterface
{

    /** @var  Node */
    protected $parent;

    protected $attrs = [];

    protected $textNode = null;

    public function __construct($data, Node $parent, Node $previousNode = null)
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
        } elseif ($this->attrs['align'] === 'right') {
            $leftAlign = ' ';
        } elseif ($this->attrs['align'] === 'center') {
            $leftAlign = ' ';
            $rightAlign = ' ';
        }

        $query = [];
        if ($this->attrs['height']) {
            $query[] = $this->attrs['width'] . 'x' . $this->attrs['height'];
        } elseif ($this->attrs['width']) {
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

        global $ID;
        $node->attr('data-resolvedHtml',
            self::resolveMedia($src, $title, $align, $width, $height, $cache, $linking));

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
        } elseif ($align === 'left') {
            $class = 'medialeft';
        } elseif ($align === 'center') {
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

    public static function resolveMedia(
        $src,
        $title = null,
        $align = null,
        $width = null,
        $height = null,
        $cache = null,
        $linking = null
    ) {
        $xhtml_renderer = p_get_renderer('xhtml');
        if (media_isexternal($src) || link_isinterwiki($src)) {
            $xhtml_renderer->externalmedia(
                $src,
                $title ?: $src,
                $align,
                $width,
                $height,
                $cache,
                $linking
            );
        } else {
            $xhtml_renderer->internalmedia(
                $src,
                $title ?: $src,
                $align,
                $width,
                $height,
                $cache,
                $linking
            );
        }
        return $xhtml_renderer->doc;
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
