<?php

use dokuwiki\plugin\prosemirror\schema\Node;
use dokuwiki\plugin\prosemirror\schema\NodeStack;

/**
 * NodeStack tests for the prosemirror plugin
 *
 * @group plugin_prosemirror
 * @group plugins
 */
class nodestack_plugin_prosemirror_test extends DokuWikiTest
{


    public function test_init()
    {
        $nodestack = new NodeStack();
        $this->assertSame('doc', $nodestack->current()->getType());
    }

    public function test_addpop()
    {
        $nodestack = new NodeStack();
        $node = new Node('foo');

        $nodestack->addTop($node);
        $this->assertSame($node, $nodestack->current());

        $popped = $nodestack->drop('foo');
        $this->assertSame($node, $popped);
    }

    public function test_dropfail()
    {
        $this->expectException('\\RuntimeException');

        $nodestack = new NodeStack();
        $node = new Node('foo');
        $nodestack->addTop($node);

        $nodestack->drop('baz');
    }

}
