<?php

namespace dokuwiki\plugin\prosemirror\parser;

class WindowsShareLinkNode extends LinkNode
{
    public function toSyntax()
    {
        $href = $this->attrs['href'];
        $href = substr($href, strlen('file:///'));
        $href = str_replace('/', '\\', $href);

        return $this->getDefaultLinkSyntax($href);
    }

    public static function render($renderer, $link, $title)
    {
        self::renderToJSON($renderer, 'other', $link, $title);
    }
}
