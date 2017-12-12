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
        if ($this->attrs['cache'] !== 'cache') {
            $query[] = $this->attrs['cache'];
        }

        $queryString = '';
        if (!empty($query)) {
            $queryString = '?' . implode('&', $query);
        }


        return '{{' . $leftAlign . $this->attrs['id'] . $queryString . $title . $rightAlign . '}}';
    }
}
