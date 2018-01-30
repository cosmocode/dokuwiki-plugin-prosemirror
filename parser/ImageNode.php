<?php

namespace dokuwiki\plugin\prosemirror\parser;


class ImageNode extends Node
{

    /** @var  Node */
    protected $parent;

    protected $attrs = [];

    public function __construct($data, $parent)
    {
        $this->parent = &$parent;
        $this->attrs = $data['attrs'];
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

    public static function render(\renderer_plugin_prosemirror $renderer, $src, $title = null, $align = null,
        $width = null, $height = null, $cache = null, $linking = null)
    {
        $node = new \dokuwiki\plugin\prosemirror\schema\Node('image');
        $node->attr('src', ml($src));
        $node->attr('title', $title);

        $class = 'media';
        if ($align === 'right') {
            $class = 'mediaright';
        } else if ($align === 'left') {
            $class = 'medialeft';
        } else if ($align === 'center') {
            $class = 'mediacenter';
        }

        $node->attr('class', $class);
        $node->attr('align', $align);
        $node->attr('width', $width);
        $node->attr('height', $height);
        $node->attr('id', $src);
        $node->attr('cache', $cache);
        $node->attr('linking', $linking);

        $renderer->addToNodestack($node);
    }
}
