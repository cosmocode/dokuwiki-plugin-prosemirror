<?php

namespace dokuwiki\plugin\prosemirror\parser;


class EmailLinkNode extends LinkNode
{

    public function toSyntax()
    {
        list(, $href) = explode(':', $this->attrs['href'], 2);

        return $this->getDefaultLinkSyntax($href, $href);
    }

    public static function render($renderer, $address, $name)
    {
        self::renderToJSON(
            $renderer,
            'emaillink',
            'mailto:' . $address,
            $name ?: $address,
            $address,
            'mail'
        );
    }
}
