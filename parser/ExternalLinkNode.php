<?php

namespace dokuwiki\plugin\prosemirror\parser;


class ExternalLinkNode extends LinkNode
{

    public function toSyntax()
    {
        $href = $this->attrs['href'];

        return $this->getDefaultLinkSyntax($href, $href);
    }

    public static function render($renderer, $link, $name)
    {
        self::renderToJSON(
            $renderer,
            'externallink',
            $link,
            $name ?: $link,
            hsc($link),
            'urlextern'
        );
    }
}
