<?php

namespace dokuwiki\plugin\prosemirror\parser;


class LocalLinkNode extends LinkNode
{

    public function toSyntax()
    {
        $hash = $this->attrs['href'];

        return $this->getDefaultLinkSyntax($hash, substr($hash, 1));
    }

    public static function render($renderer, $hash, $name)
    {
        global $ID;
        self::renderToJSON(
            $renderer,
            'locallink',
            '#' . $hash,
            $name ?: $hash,
            $ID . ' ↵',
            'wikilink1'
        );
    }
}
