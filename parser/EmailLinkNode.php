<?php

namespace dokuwiki\plugin\prosemirror\parser;


class EmailLinkNode extends LinkNode
{

    public function toSyntax()
    {
        return $this->getDefaultLinkSyntax2($this->attrs['data-inner']);
    }

    public static function render($renderer, $address, $name)
    {
        self::renderToJSON2(
            $renderer,
            'emaillink',
            $address,
            $name
        );
    }
}
