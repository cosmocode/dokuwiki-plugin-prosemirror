<?php
use dokuwiki\plugin\prosemirror\schema\Node;

/**
 * Node tests for the prosemirror plugin
 *
 * @group plugin_prosemirror
 * @group plugins
 */
class jsonParser_plugin_prosemirror_test extends DokuWikiTest {
    protected $pluginsEnabled = array('prosemirror');

    /**
     * @dataProvider rendererProvider
     *
     * @param string $json
     * @param string $expectedDokuWikiMarkup
     * @param string $msg
     */
    public function test_parser($json, $expectedDokuWikiMarkup, $msg) {
        /** @var action_plugin_prosemirror $action */
        $action = plugin_load('action', 'prosemirror');
        $actualMarkup = $action->buildTEXTFromJSON($json);
        $this->assertEquals(rtrim($expectedDokuWikiMarkup), $actualMarkup, $msg);
    }

    /**
     * @return array
     */
    public function rendererProvider() {
        $data = array();

        $files = glob(__DIR__ . '/json/*.json');
        foreach($files as $file) {
            $name = basename($file, '.json');
            $json = json_decode(file_get_contents(__DIR__ . '/json/' . $name . '.json'), true);
            $wiki = file_get_contents(__DIR__ . '/json/' . $name . '.txt');
            $data[] = array($json, $wiki, $name);
        }

        return $data;
    }
}
