<?php
/**
 * DokuWiki Plugin prosemirror (Helper Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Andreas Gohr <gohr@cosmocode.de>
 */

// must be run within Dokuwiki
if (!defined('DOKU_INC')) {
    die();
}

class helper_plugin_prosemirror extends DokuWiki_Plugin
{

    /**
     * Return info about supported methods in this Helper Plugin
     *
     * @return array of public methods
     */
    public function getMethods()
    {
        return [
            [
                'name' => 'getThreads',
                'desc' => 'returns pages with discussion sections, sorted by recent comments',
                'params' => [
                    'namespace' => 'string',
                    'number (optional)' => 'integer',
                ],
                'return' => ['pages' => 'array'],
            ],
            [// and more supported methods...
            ],
        ];
    }
}

// vim:ts=4:sw=4:et:
