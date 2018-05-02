<?php

/**
 * General tests for the prosemirror plugin
 *
 * @group plugin_prosemirror
 * @group plugins
 */
class renderer_plugin_prosemirror_test extends DokuWikiTest
{

    protected $pluginsEnabled = ['prosemirror'];

    /**
     * @dataProvider rendererProvider
     *
     * @param string $dokuwikiMarkup
     * @param string $expectedJSON
     * @param string $msg
     */
    public function test_renderer($dokuwikiMarkup, $expectedJSON, $msg)
    {
        global $ID;
        $ID = 'wiki:syntax';
        $instructions = p_get_instructions($dokuwikiMarkup);
        $doc = p_render('prosemirror', $instructions, $info);
        $this->assertJsonStringEqualsJsonString($expectedJSON, $doc, $msg);
    }

    /**
     * @return array
     */
    public function rendererProvider()
    {
        $data = [];

        $files = glob(__DIR__ . '/json/*.json');
        foreach ($files as $file) {
            $name = basename($file, '.json');
            $json = file_get_contents(__DIR__ . '/json/' . $name . '.json');
            $wiki = file_get_contents(__DIR__ . '/json/' . $name . '.txt');
            $data[] = [$wiki, $json, $name];
        }

        return $data;
    }
}
