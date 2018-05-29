<?php

namespace dokuwiki\plugin\prosemirror\parser;

class InterwikiLinkNode extends LinkNode
{

    public function toSyntax()
    {
        return $this->getDefaultLinkSyntax($this->attrs['data-inner']);
    }

    public static function render(\renderer_plugin_prosemirror $renderer, $name, $wikiName, $wikiUri)
    {
        $shortcut = $wikiName;
        $url = $renderer->_resolveInterWiki($shortcut, $wikiUri, $exists);
        $additionalAttributes = [
            'data-resolvedUrl' => $url,
            'data-resolvedClass' => 'interwikilink interwiki iw_' . $shortcut,
        ];
        self::renderToJSON(
            $renderer,
            'interwikilink',
            "$wikiName>$wikiUri",
            $name,
            $additionalAttributes
        );
    }
}
