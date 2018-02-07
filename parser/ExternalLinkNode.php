<?php

namespace dokuwiki\plugin\prosemirror\parser;


class ExternalLinkNode extends LinkNode
{
    public function __construct($data, $parent, $previousNode = false)
    {
        $this->parent = &$parent;
        if ($previousNode !== false) {
            $this->previous = &$previousNode;
        }

        $this->attrs = $data['attrs'];
    }

    public function toSyntax()
    {
        $href = $this->attrs['href'];
        $name = $this->attrs['data-name'];

        $inner = $href;
        $defaultTitle = $href;

        $title = '';
        $prefix = '';
        $postfix = '';

        if (!empty($name) && $defaultTitle !== $name) {
            $title = '|' . $name;
        }

        if (!empty($this->attrs['image-src'])) {
            $imageAttrs = [];
            foreach ($this->attrs as $key => $value) {
                @list ($keyPrefix, $attrKey) = explode('-', $key);
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

    public static function render($renderer, $link, $name)
    {
        self::renderToJSON(
            $renderer,
            'externallink',
            $link,
            $name,
            hsc($link),
            'urlextern'
        );
    }
}
