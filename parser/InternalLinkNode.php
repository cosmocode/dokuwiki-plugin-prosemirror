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
}
