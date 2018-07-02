<?php

use dokuwiki\plugin\prosemirror\parser\SyntaxTreeBuilder;

/**
 * DokuWiki Plugin prosemirror (Helper Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Andreas Gohr <gohr@cosmocode.de>
 */

class helper_plugin_prosemirror extends DokuWiki_Plugin
{

    /**
     * Decode json and parse the data back into DokuWiki Syntax
     *
     * @param string $unparsedJSON the json produced by Prosemirror
     *
     * @return null|string DokuWiki syntax or null on error
     */
    public function getSyntaxFromProsemirrorData($unparsedJSON)
    {
        $prosemirrorData = json_decode($unparsedJSON, true);
        if ($prosemirrorData === null) {
            $errorMsg = 'Error decoding prosemirror json ' . json_last_error_msg();
            throw new RuntimeException($errorMsg);
        }

        $rootNode = SyntaxTreeBuilder::parseDataIntoTree($prosemirrorData);
        $syntax = $rootNode->toSyntax();
        return $syntax;
    }
}
// vim:ts=4:sw=4:et:
