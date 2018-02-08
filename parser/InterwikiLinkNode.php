<?php

namespace dokuwiki\plugin\prosemirror\parser;

class InterwikiLinkNode extends LinkNode
{

    public function toSyntax()
    {
        $inner = $this->attrs['data-shortcut'];
        $inner .= '>';
        $reference = $this->attrs['data-reference'];
        $inner .= $reference;

        return $this->getDefaultLinkSyntax($inner, $reference);
    }

    public static function render(\renderer_plugin_prosemirror $renderer, $name, $wikiName, $wikiUri)
    {
        $shortcut = $wikiName;
        $url = $renderer->_resolveInterWiki($shortcut, $wikiUri, $exists);
        $additionalAttributes = [
            'data-shortcut' => hsc($wikiName),
            'data-reference' => hsc($wikiUri),
        ];

        self::renderToJSON(
            $renderer,
            'interwikilink',
            $url,
            $name ?: $wikiUri,
            hsc($url),
            'interwikilink interwiki iw_' . $shortcut,
            $additionalAttributes
        );
    }
}
