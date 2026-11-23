<?php

namespace dokuwiki\plugin\prosemirror\test;

use DokuWikiTest;
use TestRequest;

/**
 * Access tests for the AJAX endpoints of the prosemirror plugin
 *
 * @group plugin_prosemirror
 * @group plugins
 */
class AjaxTest extends DokuWikiTest
{
    protected $pluginsEnabled = ['prosemirror'];

    /**
     * @return array[] [request parameters]
     */
    public function callProvider()
    {
        return [
            'resolve' => [['call' => 'plugin_prosemirror', 'actions' => ['resolveInternalLink'], 'inner' => 'foo']],
            'switch editors' => [['call' => 'plugin_prosemirror_switch_editors', 'getJSON' => '1', 'data' => 'foo']],
        ];
    }

    /**
     * Users who may edit the page of the request get a response
     *
     * @dataProvider callProvider
     *
     * @param array $params the request parameters
     */
    public function testEditorIsAllowed($params)
    {
        $response = (new TestRequest())->post($params + ['id' => 'wiki:start'], '/lib/exe/ajax.php');
        $this->assertIsArray(json_decode($response->getContent(), true));
    }

    /**
     * Users who may not edit the page of the request get no data
     *
     * @dataProvider callProvider
     *
     * @param array $params the request parameters
     */
    public function testReaderIsDenied($params)
    {
        foreach (['users:foo', 'USERS:foo', 'private:foo'] as $id) {
            $response = (new TestRequest())->post($params + ['id' => $id], '/lib/exe/ajax.php');
            $this->assertEquals('', $response->getContent(), $id);
        }
    }
}
