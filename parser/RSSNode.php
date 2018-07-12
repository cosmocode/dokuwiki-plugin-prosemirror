<?php

namespace dokuwiki\plugin\prosemirror\parser;

class RSSNode extends Node
{

    protected $parent;
    protected $data;

    public function __construct($data, $parent)
    {
        $this->parent = &$parent;
        $this->data = $data;
    }

    public function toSyntax()
    {
        $prefix = '{{rss>';
        $url = '';
        $attrs = $this->data['attrs'];
        if (!empty($attrs['url'])) {
            $url = $attrs['url'];
        }
        $paramString = '';

            if (!empty($attrs['max']) && $attrs['max'] !== 8) {
                $paramString .= ' ' . $attrs['max'];
            }

            if (!empty($attrs['reverse'])) {
                $paramString .= ' reverse';
            }

            if (!empty($attrs['author'])) {
                $paramString .= ' author';
            }

            if (!empty($attrs['date'])) {
                $paramString .= ' date';
            }

            if (!empty($attrs['details'])) {
                $paramString .= ' description';
            }

            if (!empty($attrs['refresh']) && $attrs['refresh'] !== '4h') {
                $paramString .= ' ' . $attrs['refresh'];
            }
        $postfix = '}}';
        return $prefix . $url . $paramString . $postfix;
    }
}
