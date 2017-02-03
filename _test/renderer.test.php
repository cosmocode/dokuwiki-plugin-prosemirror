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
        return array(
            array(
                '**bold**',
                '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"bold","marks":[{"type":"strong"}]}]}]}',
                'test_marks'
            ),
            array(
                '
  * single list item
  * another first lvl li
    * second level li
  * again first level li
        ',
                '{"type":"doc","content":[{"type":"bullet_list","content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":" single list item"}]}]},{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":" another first lvl li"},{"type":"bullet_list","content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":" second level li"}]}]}]}]}]},{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":" again first level li"}]}]}]}]}',
                'test_stack'
            ),
            array(
                '[[name:space:page]]',
                '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"page","marks":[{"type":"link","attrs":{"href":"/./doku.php?id=name:space:page","title":"name:space:page"}}]}]}]}',
                'test_internallink'
            ),
            array(
                '[[name:space:page|linktext]]',
                '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"linktext","marks":[{"type":"link","attrs":{"href":"/./doku.php?id=name:space:page","title":"name:space:page"}}]}]}]}',
                'test_internallink_with_title'
            ),
            array(
                '[[name:space:page?foo=bar]]',
                '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"page","marks":[{"type":"link","attrs":{"href":"/./doku.php?id=name:space:page&amp;foo=bar","title":"name:space:page"}}]}]}]}',
                'test_internallink_with_query'
            ),
        );

    }

}
