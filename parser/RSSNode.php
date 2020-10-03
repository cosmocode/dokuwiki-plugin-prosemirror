<?php

namespace dokuwiki\plugin\prosemirror\parser;

class RSSNode extends Node
{

    protected $parent;
    protected $data;

    public function __construct($data, Node $parent)
    {
        $this->parent = &$parent;
        $this->data = $data;
    }

    public function toSyntax()
    {
        $attrs = $this->data['attrs'];
        return self::attrToSyntax($attrs);
    }

    protected static function attrToSyntax($attrs) {
        $prefix = '{{rss>';
        $url = '';
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

    public static function renderAttrsToHTML($attrs) {
        $syntax = self::attrToSyntax($attrs);
        $ins = p_get_instructions($syntax);
        return p_render('xhtml', $ins, $info);
    }
}
