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

        $additionalAttributes = [
            'data-resolvedTitle' => $ID . ' ↵',
            'data-resolvedID' => $ID . '#' . $hash,
            'data-resolvedName' => $hash,
            'data-resolvedClass' => 'wikilink1',
        ];

        self::renderToJSON2(
            $renderer,
            'internallink',
            '#' . $hash,
            $name,
            $additionalAttributes
        );
    }

    public static function resolveLocalLink($hash, $id)
    {
        $trimmedHash = trim($hash, '#');
        return [
            'id' => $id . '#' . $trimmedHash,
            'exists' => true,
            'heading' => $trimmedHash,
            'title' => $id . ' ↵',
        ];
    }
}
