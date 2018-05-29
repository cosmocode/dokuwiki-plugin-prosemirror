<?php

namespace dokuwiki\plugin\prosemirror\parser;

class EmailLinkNode extends LinkNode
{

    public function toSyntax()
    {
        return $this->getDefaultLinkSyntax($this->attrs['data-inner']);
    }

    public static function render($renderer, $address, $name)
    {
        self::renderToJSON(
            $renderer,
            'emaillink',
            $address,
            $name
        );
    }
}
