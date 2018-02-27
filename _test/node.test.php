<?php

use dokuwiki\plugin\prosemirror\schema\Node;

/**
 * Node tests for the prosemirror plugin
 *
 * @group plugin_prosemirror
 * @group plugins
 */
class node_plugin_prosemirror_test extends DokuWikiTest
{


    public function test_normnode()
    {
        // empty node
        $node = new Node('foo');
        $this->assertSame('foo', $node->getType());
        $this->assertSame(null, $node->getText());
        $this->assertJsonStringEqualsJsonString(
            '{
                "type": "foo"
             }',
            json_encode($node)
        );

        // add attributes
        $node->attr('foo', 'bar');
        $node->attr('bar', 'bar');
        $node->attr('foo', 'foo');
        $this->assertSame('foo', $node->attr('foo'));
        $this->assertSame('bar', $node->attr('bar'));
        $this->assertJsonStringEqualsJsonString(
            '{
                "type": "foo",
                "attrs": {
                    "foo": "foo",
                    "bar": "bar"
                }
             }',
            json_encode($node)
        );

        // add child
        $child = new Node('bar');
        $node->addChild($child);
        $this->assertJsonStringEqualsJsonString(
            '{
                "type": "foo",
                "attrs": {
                    "foo": "foo",
                    "bar": "bar"
                },
                "content": [
                    {
                        "type": "bar"
                    }
                ]
             }',
            json_encode($node)
        );

        // set text
        $this->expectException('\\RuntimeException');
        $node->setText('hallo');
    }

    public function test_textnode()
    {
        // empty node
        $node = new Node('text');
        $this->assertSame('text', $node->getType());
        $this->assertSame('', $node->getText());
        $this->assertJsonStringEqualsJsonString(
            '{
                "type": "text",
                "text": ""
             }',
            json_encode($node)
        );

        // add attributes
        $node->attr('foo', 'bar');
        $node->attr('bar', 'bar');
        $node->attr('foo', 'foo');
        $this->assertSame('foo', $node->attr('foo'));
        $this->assertSame('bar', $node->attr('bar'));
        $this->assertJsonStringEqualsJsonString(
            '{
                "type": "text",
                "text": "",
                "attrs": {
                    "foo": "foo",
                    "bar": "bar"
                }
             }',
            json_encode($node)
        );

        // add text
        $node->setText('hallo');
        $this->assertJsonStringEqualsJsonString(
            '{
                "type": "text",
                "attrs": {
                    "foo": "foo",
                    "bar": "bar"
                },
                "text": "hallo"
             }',
            json_encode($node)
        );

        // add child
        $this->expectException('\\RuntimeException');
        $child = new Node('bar');
        $node->addChild($child);
    }

}
