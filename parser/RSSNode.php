<?php

namespace dokuwiki\plugin\prosemirror\parser;

class RSSNode extends Node
{

    protected $parent;
    protected $data;

    public function __construct($data, $parent)
    {
        $this->parent = &$parent;
        $this->data = $data;
    }

    public function toSyntax()
    {
        $prefix = '{{rss>';
        $url = '';
        if (!empty($this->data['attrs']['data-url'])) {
            $url = $this->data['attrs']['data-url'];
        }
        $paramString = '';
        if (!empty($this->data['attrs']['data-params'])) {
            $params = json_decode($this->data['attrs']['data-params'], true);
            // FIXME check for correct json decoding

            if (!empty($params['max'])) {
                $paramString .= ' ' . $params['max'];
            }

            if (!empty($params['reverse'])) {
                $paramString .= ' reverse';
            }

            if (!empty($params['author'])) {
                $paramString .= ' author';
            }

            if (!empty($params['date'])) {
                $paramString .= ' date';
            }

            if (!empty($params['description'])) {
                $paramString .= ' description';
            }

            if (!empty($params['refresh'])) {
                $paramString .= ' ' . ($params['refresh']) / 60 . 'm';
            }
        }
        $postfix = '}}';
        return $prefix . $url . $paramString . $postfix;
    }
}
