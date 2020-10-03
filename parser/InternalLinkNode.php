<?php

namespace dokuwiki\plugin\prosemirror\parser;

class InternalLinkNode extends LinkNode
{
    public function toSyntax()
    {
        return $this->getDefaultLinkSyntax($this->attrs['data-inner']);
    }

    public static function render(\renderer_plugin_prosemirror $renderer, $originalId, $name)
    {
        global $ID;
        $additionalAttributes = [];

        $resolvedAttributes = self::resolveLink($originalId, $ID);
        $additionalAttributes['data-resolvedTitle'] = $resolvedAttributes['id'];
        $additionalAttributes['data-resolvedID'] = $resolvedAttributes['id'];
        if (!is_array($name)) {
            $additionalAttributes['data-resolvedName'] = $name ?: $resolvedAttributes['heading'];
            if ($resolvedAttributes['exists']) {
                $class = 'wikilink1';
            } else {
                $class = 'wikilink2';
            }
            $additionalAttributes['data-resolvedClass'] = $class;
        }

        self::renderToJSON(
            $renderer,
            'internallink',
            $originalId,
            $name,
            $additionalAttributes
        );
    }

    public static function resolveLink($inner, $curId) {
        $params = '';
        $parts = explode('?', $inner, 2);
        $resolvedPageId = $parts[0];
        if (count($parts) === 2) {
            $params = $parts[1];
        }
        $ns = getNS($curId);
        $xhtml_renderer = p_get_renderer('xhtml');
        $default = $xhtml_renderer->_simpleTitle($parts[0]);
        resolve_pageid($ns, $resolvedPageId, $exists);

        if (useHeading('content')) {
            $heading = p_get_first_heading($resolvedPageId);
        }
        if (empty($heading)) {
            $heading = $default;
        }

        $url = wl($resolvedPageId, $params);

        return [
            'id' => $resolvedPageId,
            'exists' => $exists,
            'heading' => $heading,
            'url' => $url,
        ];
    }

    protected static function getLinkTitle($title, $default, $id)
    {
        if (null === $title || trim($title) == '') {
            if (useHeading('content') && $id) {
                $heading = p_get_first_heading($id);
                if (!blank($heading)) {
                    return hsc($heading);
                }
            }
            return hsc($default);
        }
        return hsc($title);
    }
}
