<?php

namespace dokuwiki\plugin\prosemirror\parser;

class SyntaxTreeBuilder
{

    /**
     * Expects the array decoded from prosemirror's JSON
     *
     * @param array $prosemirrorData
     *
     * @return Node
     */
    public static function parseDataIntoTree($prosemirrorData)
    {
        $rootNode = new RootNode($prosemirrorData['content']);
//        var_dump($rootNode);
        return $rootNode;
    }
}
