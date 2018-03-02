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
        @list($id,) = explode('?', $originalId, 2);

        // For empty $id we need to know the current $ID
        // We need this check because _simpleTitle needs
        // correct $id and resolve_pageid() use cleanID($id)
        // (some things could be lost)
        if ($id === '') {
            $id = $ID;
        }


        $resolvedId = $id;
        resolve_pageid(getNS($ID), $resolvedId, $exists);
        $additionalAttributes['data-resolvedTitle'] = $resolvedId;
        $additionalAttributes['data-resolvedID'] = $resolvedId;

        if (!is_array($name)) {
            $additionalAttributes['data-resolvedName'] = self::getLinkTitle($name, $renderer->_simpleTitle($id), $resolvedId);

            if ($exists) {
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
