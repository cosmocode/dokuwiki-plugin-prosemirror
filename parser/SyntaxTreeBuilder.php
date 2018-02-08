<?php

namespace dokuwiki\plugin\prosemirror\parser;

class SyntaxTreeBuilder
{

    /**
     * @param $json
     *
     * @return Node
     */
    public static function parseJsonIntoTree($json)
    {
        $data = json_decode($json, true);

        $rootNode = new RootNode($data['content']);
//        var_dump($rootNode);
        return $rootNode;
    }
}
