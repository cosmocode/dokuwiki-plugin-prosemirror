<?php
/**
 * General tests for the prosemirror plugin
 *
 * @group plugin_prosemirror
 * @group plugins
 */
class renderer_plugin_prosemirror_test extends DokuWikiTest {

    protected $pluginsEnabled = array('prosemirror');

    /**
     * @dataProvider rendererProvider
     *
     * @param string $dokuwikiMarkup
     * @param string $expectedJSON
     * @param string $msg
     */
    public function test_renderer($dokuwikiMarkup, $expectedJSON, $msg) {
        $instructions = p_get_instructions($dokuwikiMarkup);
        $doc = p_render('prosemirror', $instructions, $info);
        $this->assertJsonStringEqualsJsonString($expectedJSON, $doc, $msg);
    }

    /**
     * @return array
     */
    public function rendererProvider() {
        $json = file_get_contents(__DIR__ . '/testdata.json');
        $data = json_decode($json, true);
        return $data;
    }
}
