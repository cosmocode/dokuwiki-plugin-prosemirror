<?php

namespace dokuwiki\plugin\prosemirror\test;

use DokuWikiTest;

/**
 * General tests for the prosemirror plugin
 *
 * @group plugin_prosemirror
 * @group plugins
 */
class RendererTest extends DokuWikiTest
{

    protected $pluginsEnabled = ['prosemirror', 'wrap'];

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
        $instructions = plugin_load('helper', 'prosemirror')->getInstructions($dokuwikiMarkup);
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

    /**
     * @return array[] [syntax]
     */
    public function hruleMarkdownProvider()
    {
        return [
            'dashes' => ["foo\n\n---\n\nbar"],
            'asterisks without blank lines' => ["foo\n***\nbar"],
            'underscores, blank line after' => ["foo\n_____\n\nbar"],
        ];
    }

    /**
     * Rules only accepted with Markdown syntax enabled are saved as they were written
     *
     * @dataProvider hruleMarkdownProvider
     *
     * @param string $syntax
     */
    public function test_hruleMarkdownRoundTrip($syntax)
    {
        global $conf;
        $conf['syntax'] = 'md+dw';

        $helper = plugin_load('helper', 'prosemirror');
        $json = p_render('prosemirror', $helper->getInstructions($syntax), $info);
        $this->assertStringContainsString('"markup"', $json);
        $this->assertEquals($syntax, rtrim($helper->getSyntaxFromProsemirrorData($json)));
    }

    /**
     * A PARSER_WIKITEXT_PREPROCESS handler that changes the text moves the instruction positions
     * away from the original text; the rule then keeps the defaults instead of taking another line
     */
    public function test_hrulePreprocessedText()
    {
        global $EVENT_HANDLER;
        $EVENT_HANDLER->register_hook('PARSER_WIKITEXT_PREPROCESS', 'BEFORE', null, function ($event) {
            // moves the rule's position in the original text onto the newline before "bar"
            $event->data = "abcde\n" . $event->data;
        });

        $helper = plugin_load('helper', 'prosemirror');
        $instructions = $helper->getInstructions("foo\n-----\nbar");
        $hr = array_values(array_filter($instructions, fn($i) => $i[0] === 'hr'));
        $this->assertCount(1, $hr);
        $this->assertSame([], $hr[0][1]);
    }
}
