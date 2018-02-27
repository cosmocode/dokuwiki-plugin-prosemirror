<?php

namespace dokuwiki\plugin\prosemirror\parser;


class ExternalLinkNode extends LinkNode
{
    public function toSyntax()
    {
        return $this->getDefaultLinkSyntax2($this->attrs['data-inner']);
    }

    public static function render($renderer, $link, $name)
    {
        self::renderToJSON2(
            $renderer,
            'externallink',
            $link,
            $name
        );
    }
}
