<?php

namespace dokuwiki\plugin\prosemirror\parser;

class ExternalLinkNode extends LinkNode
{
    public function toSyntax()
    {
        return $this->getDefaultLinkSyntax($this->attrs['data-inner']);
    }

    public static function render($renderer, $link, $name)
    {
        self::renderToJSON(
            $renderer,
            'externallink',
            $link,
            $name
        );
    }
}
