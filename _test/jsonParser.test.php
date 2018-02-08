<?php

use dokuwiki\plugin\prosemirror\parser\SyntaxTreeBuilder;
use dokuwiki\plugin\prosemirror\schema\Node;

/**
 * Node tests for the prosemirror plugin
 *
 * @group plugin_prosemirror
 * @group plugins
 */
class jsonParser_plugin_prosemirror_test extends DokuWikiTest
{
    protected $pluginsEnabled = array('prosemirror');

    /**
     * @dataProvider rendererProvider
     *
     * @param string $json
     * @param string $expectedDokuWikiMarkup
     * @param string $msg
     */
    public function test_parser($json, $expectedDokuWikiMarkup, $msg)
    {
        $rootNode = SyntaxTreeBuilder::parseJsonIntoTree($json);
        $actualMarkup = $rootNode->toSyntax();
        $this->assertEquals(rtrim($expectedDokuWikiMarkup), rtrim($actualMarkup), $msg);
    }

    /**
     * @return array
     */
    public function rendererProvider()
    {
        $data = array();

        $files = glob(__DIR__ . '/json/*.json');
        foreach ($files as $file) {
            $name = basename($file, '.json');
            $json = file_get_contents(__DIR__ . '/json/' . $name . '.json');
            $wiki = file_get_contents(__DIR__ . '/json/' . $name . '.txt');
            $data[] = array($json, $wiki, $name);
        }

        return $data;
    }
}
