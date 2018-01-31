<?php

namespace dokuwiki\plugin\prosemirror\parser;


class InternalLinkNode extends LinkNode
{
    public function toSyntax()
    {
        // try data attributes
        $id = $this->attrs['data-id'];
        $queryString = $this->attrs['data-query'];
        $hash = $this->attrs['data-hash'];

        // parse from url if we don't have data
        if (empty($id)) {
            $id = explode(' ', $this->attrs['title'], 2)[0];
            $href = $this->attrs['href'];
            $components = parse_url($href);
            $queryString = $components['query'];
            parse_str($queryString, $query);
            if (!empty($query['id'])) {
                $id = $query['id'];
                unset($query['id']);
            }
            $queryString = implode('&', $query);
            $hash = $components['fragment'];
        }

        $inner = $id . ($queryString ? '?' . $queryString : '') . ($hash ? '#' . $hash : '');

        $dokuRenderer = new \Doku_Renderer();
        $defaultTitle = $dokuRenderer->_simpleTitle($id . ($hash ? '#' . $hash : ''));

        return $this->getDefaultLinkSyntax($inner, $defaultTitle);
    }

    public static function render(\renderer_plugin_prosemirror $renderer, $id, $name)
    {
        global $ID;
        @list($id, $params) = explode('?', $id, 2);

        // For empty $id we need to know the current $ID
        // We need this check because _simpleTitle needs
        // correct $id and resolve_pageid() use cleanID($id)
        // (some things could be lost)
        if($id === '') {
            $id = $ID;
        }

        if (!$name) {
            $name = $renderer->_simpleTitle($id);
        }


        //keep hash anchor
        @list($id, $originalHash) = explode('#', $id, 2);
        if(!empty($originalHash)) {
            $check = false;
            $hash = sectionID($originalHash, $check);
        } else {
            $hash = '';
        }

        $resolvedId = $id;
        resolve_pageid(getNS($ID), $resolvedId, $exists);

        if ($exists) {
            $class = 'wikilink1';
        } else {
            $class = 'wikilink2';
        }
        $url = wl($resolvedId, $params) . ($hash ? '#' . $hash : '');


        $additionalAttributes = [
            'data-id' => $id,
            'data-query' => $params,
            'data-hash' => $originalHash
        ];

        self::renderToJSON(
            $renderer,
            'internallink',
            $url,
            $name,
            $resolvedId,
            $class,
            $additionalAttributes
        );
    }
}
