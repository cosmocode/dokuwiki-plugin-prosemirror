<?php

namespace dokuwiki\plugin\prosemirror\test;

use DokuWikiTest;
use dokuwiki\plugin\prosemirror\parser\SyntaxTreeBuilder;

/**
 * Node tests for the prosemirror plugin
 *
 * @group plugin_prosemirror
 * @group plugins
 */
class JsonParserTest extends DokuWikiTest
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

    /**
     * @return array[] [top-level nodes, expected syntax]
     */
    public function hruleInsertedProvider()
    {
        $text = static fn($text) => [['type' => 'text', 'text' => $text]];
        $para = static fn($str) => ['type' => 'paragraph', 'content' => $text($str)];
        $hr = ['type' => 'horizontal_rule'];

        return [
            'in the middle of a paragraph' => [[$para('foo'), $hr, $para('bar')], "foo\n\n----\n\nbar"],
            'at the start of the page' => [[$hr, $para('foo')], "----\n\nfoo"],
            'at the end of the page' => [[$para('foo'), $hr, ['type' => 'paragraph']], "foo\n\n----"],
        ];
    }

    /**
     * Documents the horizontal rule menu command produces are saved as valid wiki syntax
     *
     * The command splits the paragraph at the cursor and adds an empty paragraph after a rule at
     * the end of the page. Loading wiki syntax never creates that empty paragraph, so these cases
     * are not fixtures in `json/`, which are tested both ways.
     *
     * @dataProvider hruleInsertedProvider
     *
     * @param array $content the document's top-level nodes
     * @param string $expected the expected wiki syntax
     */
    public function test_hruleInserted($content, $expected)
    {
        $doc = ['type' => 'doc', 'content' => $content];
        $rootNode = SyntaxTreeBuilder::parseDataIntoTree($doc);
        $this->assertEquals($expected, trim($rootNode->toSyntax()));
    }

    /**
     * A rule right after a table keeps its blank line, without it the rule isn't parsed as one
     */
    public function test_hruleAfterTable()
    {
        $cell = [
            'type' => 'table_cell',
            'attrs' => ['colspan' => 1, 'rowspan' => 1, 'align' => null],
            'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'a']]]],
        ];
        $doc = [
            'type' => 'doc',
            'content' => [
                ['type' => 'table', 'content' => [['type' => 'table_row', 'content' => [$cell]]]],
                ['type' => 'horizontal_rule', 'attrs' => ['blankBefore' => false]],
            ],
        ];

        $rootNode = SyntaxTreeBuilder::parseDataIntoTree($doc);
        $this->assertEquals("| a |\n\n----", trim($rootNode->toSyntax()));
    }

    /**
     * @return array[] [rss attributes, expected syntax]
     */
    public function rssAttributesProvider()
    {
        $url = 'http://example.com/feed';

        return [
            'braces in url' => [['url' => 'x}} **BOLD** {{rss>y'], '{{rss>x%7D%7D%20**BOLD**%20%7B%7Brss%3Ey}}'],
            'spaces in url' => [['url' => "$url?a=1 2\n"], "{{rss>$url?a=1%202%0A}}"],
            'invalid chars in url' => [['url' => "$url?q=\"<|\\^`"], "{{rss>$url?q=%22%3C%7C%5C%5E%60}}"],
            'valid chars in url' => [['url' => "$url?a=1&b=%20#x"], "{{rss>$url?a=1&b=%20#x}}"],
            'syntax in max' => [['url' => $url, 'max' => '5}} **BOLD**'], "{{rss>$url}}"],
            'syntax in refresh' => [['url' => $url, 'refresh' => '1h}} **BOLD**'], "{{rss>$url}}"],
            'valid values' => [['url' => $url, 'max' => '5', 'refresh' => '2d'], "{{rss>$url 5 2d}}"],
        ];
    }

    /**
     * Attributes from the editor form cannot break out of the RSS syntax
     *
     * @dataProvider rssAttributesProvider
     *
     * @param array $attrs the RSS node attributes
     * @param string $expected the expected wiki syntax
     */
    public function test_rssAttributes($attrs, $expected)
    {
        $doc = ['type' => 'doc', 'content' => [['type' => 'rss', 'attrs' => $attrs]]];
        $rootNode = SyntaxTreeBuilder::parseDataIntoTree($doc);
        $this->assertEquals($expected, trim($rootNode->toSyntax()));
    }
}
