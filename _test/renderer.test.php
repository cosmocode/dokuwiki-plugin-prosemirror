<?php
/**
 * General tests for the prosemirror plugin
 *
 * @group plugin_prosemirror
 * @group plugins
 */
class renderer_plugin_prosemirror_test extends DokuWikiTest {

    protected $pluginsEnabled = array('prosemirror');

    public function test_marks() {
        $instructions = p_get_instructions('**bold**');
        $doc = p_render('prosemirror', $instructions, $info);

        $expect = '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"bold","marks":[{"type":"strong"}]}]}]}';
        $this->assertJsonStringEqualsJsonString($expect, json_encode($doc));
    }

}
