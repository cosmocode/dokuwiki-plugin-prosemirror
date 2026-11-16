<?php

use dokuwiki\plugin\prosemirror\parser\SyntaxTreeBuilder;

/**
 * Node tests for the prosemirror plugin
 *
 * @group plugin_prosemirror
 * @group plugins
 */
class jsonParser_plugin_prosemirror_test extends DokuWikiTest
{
    protected $pluginsEnabled = ['prosemirror', 'wrap'];

    /**
     * @dataProvider rendererProvider
     *
     * @param string $json
     * @param string $expectedDokuWikiMarkup
     * @param string $msg
     */
    public function test_parser($json, $expectedDokuWikiMarkup, $msg)
    {
        $rootNode = SyntaxTreeBuilder::parseDataIntoTree(json_decode($json, true));
        $actualMarkup = $rootNode->toSyntax();
        $this->assertEquals(rtrim($expectedDokuWikiMarkup), rtrim($actualMarkup), $msg);
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
            $data[] = [$json, $wiki, $name];
        }

        return $data;
    }

    /**
     * @return array[] [paragraphs, align, expected syntax]
     */
    public function cellParagraphsProvider()
    {
        $one = [['type' => 'text', 'text' => 'one']];
        $two = [['type' => 'text', 'text' => 'two']];
        $oneBreak = [['type' => 'text', 'text' => 'one'], ['type' => 'hard_break']];
        $spaces = [['type' => 'text', 'text' => '  ']];

        return [
            'two paragraphs' => [[$one, $two], null, '| one\\\\ two |'],
            'two paragraphs, centered' => [[$one, $two], 'center', '|  one\\\\ two  |'],
            'empty paragraph in between' => [[$one, [], $two], null, '| one\\\\ \\\\ two |'],
            'two empty paragraphs in between' => [[$one, [], [], $two], null, '| one\\\\ \\\\ \\\\ two |'],
            'blank paragraph in between' => [[$one, $spaces, $two], null, '| one\\\\ \\\\ two |'],
            'empty paragraph at the start' => [[[], $one], null, '| \\\\ one |'],
            'empty paragraph at the end' => [[$one, []], null, '| one\\\\  |'],
            'empty paragraph at the end, centered' => [[$one, []], 'center', '|  one\\\\   |'],
            'only empty paragraphs' => [[[], []], null, '|  |'],
            'first ends with a break' => [[$oneBreak, $two], null, '| one\\\\ \\\\ two |'],
            'last ends with a break, left' => [[$two, $oneBreak], 'left', '| two\\\\ one\\\\   |'],
        ];
    }

    /**
     * Several paragraphs in a table cell are saved as one line, joined with hard breaks
     *
     * The editor can hold such cells (e.g. after a paste), but loading wiki syntax never
     * creates them, so these cases cannot be fixtures in `json/`, which are tested both ways.
     *
     * @dataProvider cellParagraphsProvider
     *
     * @param array $paragraphs content arrays of the cell's paragraphs
     * @param string|null $align the cell's alignment
     * @param string $expected the expected table row
     */
    public function test_cellParagraphs($paragraphs, $align, $expected)
    {
        $cell = [
            'type' => 'table_cell',
            'attrs' => ['colspan' => 1, 'rowspan' => 1, 'align' => $align],
            'content' => array_map(
                static fn($content) => ['type' => 'paragraph', 'content' => $content],
                $paragraphs
            ),
        ];
        $doc = [
            'type' => 'doc',
            'content' => [[
                'type' => 'table',
                'content' => [['type' => 'table_row', 'content' => [$cell]]],
            ]],
        ];

        $rootNode = SyntaxTreeBuilder::parseDataIntoTree($doc);
        $this->assertEquals($expected, trim($rootNode->toSyntax()));
    }
}
