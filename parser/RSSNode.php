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

    /**
     * Build the RSS syntax from the node attributes
     *
     * ASCII characters that are not allowed in a URL are percent-encoded. Invalid max and refresh values are dropped.
     *
     * @param array $attrs the RSS node attributes
     * @return string
     */
    protected static function attrToSyntax($attrs)
    {
        $prefix = '{{rss>';
        $url = '';
        if (!empty($attrs['url'])) {
            $url = preg_replace_callback(
                '/[\x00-\x20"<>\\\\^`{|}\x7F]/',
                static fn($m) => rawurlencode($m[0]),
                (string)$attrs['url']
            );
        }
        $paramString = '';

        // int 8 is the core default when the syntax has no number, an explicit "8" stays in the syntax
        if (!empty($attrs['max']) && $attrs['max'] !== 8 && ctype_digit((string)$attrs['max'])) {
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

        if (
            !empty($attrs['refresh']) && $attrs['refresh'] !== '4h' &&
            preg_match('/^\d+[dhm]$/', (string)$attrs['refresh'])
        ) {
            $paramString .= ' ' . $attrs['refresh'];
        }
        $postfix = '}}';
        return $prefix . $url . $paramString . $postfix;
    }

    public static function renderAttrsToHTML($attrs)
    {
        $syntax = self::attrToSyntax($attrs);
        $ins = p_get_instructions($syntax);
        return p_render('xhtml', $ins, $info);
    }
}
