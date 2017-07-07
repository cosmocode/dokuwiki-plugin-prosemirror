<?php
/**
 * DokuWiki Plugin prosemirror (Action Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Andreas Gohr <gohr@cosmocode.de>
 */

// must be run within Dokuwiki
if (!defined('DOKU_INC')) {
    die();
}

class action_plugin_prosemirror extends DokuWiki_Action_Plugin {

    /**
     * Registers a callback function for a given event
     *
     * @param Doku_Event_Handler $controller DokuWiki's event controller object
     *
     * @return void
     */
    public function register(Doku_Event_Handler $controller) {

        $controller->register_hook('DOKUWIKI_STARTED', 'FIXME', $this, 'handle_dokuwiki_started');
        $controller->register_hook('ACTION_ACT_PREPROCESS', 'BEFORE', $this, 'handle_preprocess');

    }

    /**
     * [Custom event handler which performs action]
     *
     * @param Doku_Event $event  event object by reference
     * @param mixed      $param  [the parameters passed as fifth argument to register_hook() when this
     *                           handler was registered]
     *
     * @return void
     */
    public function handle_preprocess(Doku_Event $event, $param) {
        global $TEXT, $INPUT;
        dbglog($INPUT, __FILE__ . ': ' . __LINE__);
        if ($INPUT->server->str('REQUEST_METHOD') != 'POST' || !$INPUT->post->has('prosemirror_data')) {
            dbglog('We are only interested in posts from prosemirror', __FILE__ . ': ' . __LINE__);
            return;
        }
        $json = json_decode($INPUT->post->str('prosemirror_data'), true);
        if ($json === null) {
            msg('Error decoding prosemirror data' - 1);
            return;
        }

        $TEXT = $this->buildTEXTFromJSON($json);
    }

    public function buildTEXTFromJSON($json) {
        if ($json['type'] != 'doc') {
            throw new Exception('root node must be doc');
        }

        $json['content'] = array_map([$this, 'parseNode'], $json['content']);

        $doc = $this->parseNodeContents($json['content'], 'doc');


        return null;
//        return implode("\n", array_reduce($json['content'], [$this, 'buildNodeTree'], []));
    }

    public function parseNodeContents(array $content, $parentNodeType) {
        $doc = '';
        $openMarkStack = [];
        foreach ($content as $index => &$item) {
            if ($item['type'] === 'text') {
                usort($item['dw']['opening marks'], [$this, 'sortMarksCallback']);
                if (isset($content[$index + 1]) && $content[$index + 1] === 'text') {
                    foreach ($item['dw']['closing marks'] as $closingIndex => $mark) {
                        $openingIndex = array_search($mark, $content[$index + 1]['dw']['opening marks']);
                        if ($openingIndex !== false) {
                            unset($content[$openingIndex + 1]['dw']['opening marks'][$openingIndex]);
                            unset($item['dw']['closing marks'][$closingIndex]);
                        }
                    }
                    if (array_intersect($openMarkStack, $item['dw']['opening marks'])) {
                        // fixme: this sould never happen, we cannot open an already open environment
                        throw new Exception('we cannot open an already open environment');
                    }

                    foreach ($item['dw']['opening marks'] as $mark) {
                        $openMarkStack[] = $mark;
                        $doc .= $mark;
                    }

                    $doc .= $item['dw']['inner'];

                    while (count($item['dw']['closing marks']) > 0) {
                        $innermostClosingMark = $this->closingElement(array_pop($openMarkStack));
                        if (!in_array($innermostClosingMark, $item['dw']['closing marks'])) {
                            throw new Exception('We are trying to close a mark that is not the last opened one!');
                        }
                        $doc .= $innermostClosingMark;
                        unset($item['dw']['closing marks'][array_search($innermostClosingMark, $item['dw']['closing marks'])]);
                    }
                }
            }
        }
        return $doc;
    }

    public function closingElement($openingElement) {
        $closingElement = [
            '[[' => ']]',
            '<sup>' => '</sup>',
            '<sub>' => '</sub>',
        ];
        if (isset($closingElement[$openingElement])) {
            return $closingElement[$openingElement];
        }
        return $openingElement;
    }


    public static $markOrder = [
        '[[' => 0,
        ']]' => 0,
        '**' => 1,
        '__' => 2,
        '//' => 3,
        '\'\'' => 4,
        '<sub>' => 5,
        '</sub>' => 5,
        '<sup>' => 6,
        '</sup>' => 6,
    ];

    public function sortMarksCallback($a, $b) {
        return self::$markOrder[$a] - self::$markOrder[$b];
    }

    public function parseNode($node) {
        switch ($node['type']) {
            case 'paragraph':
                return $this->parseParagraphNode($node);
            case 'bullet_list':
                return $this->parseList($node);
            case 'text':
                return $this->parseTextNode($node);
            default:
                // fixme: trigger plugin event?
        }
        return $node;
    }

    public function parseList($node) {
        return $node;
        if ($node['type'] == 'bullet_list') {
            $prefix = '  * ';
        } else {
            $prefix = '  - ';
        }
        $lines = [];
        foreach ($node['content'] as $listitem) {
            $litext = $prefix . $this->parseParagraphNode($listitem['content'][0])[0];
            $lines[] = $litext;
            if (isset($listitem['content'][1])) {
                $sublistLines = $this->parseList($listitem['content'][1]);
                foreach ($sublistLines as $sublistLine) {
                    $lines[] = '  ' . $sublistLine;
                }
            }
        }
        return $lines;
    }

    public function parseParagraphNode($node) {
        $node['content'] = array_map([$this, 'parseNode'], $node['content']);
        return $node;
//        return array_reduce($node['content'], [$this, 'buildNodeTree'], []);
    }

    public function parseTextNode($node) {
        $node['dw'] = [
            'opening marks' => [],
            'closing marks' => [],
            'inner' => $node['text'],
        ];
        if (!isset($node['marks'])) {
            return $node;
        }
        foreach ($node['marks'] as $mark) {
            switch ($mark['type']) {
                case 'strong':
                    $node['dw']['opening marks'][] = '**';
                    $node['dw']['closing marks'][] = '**';
                    break;
                case 'em':
                    $node['dw']['opening marks'][] = '//';
                    $node['dw']['closing marks'][] = '//';
                    break;
                case 'underline':
                    $node['dw']['opening marks'][] = '__';
                    $node['dw']['closing marks'][] = '__';
                    break;
                case 'code':
                    $node['dw']['opening marks'][] = '\'\'';
                    $node['dw']['closing marks'][] = '\'\'';
                    break;
                case 'link':
                    $localPrefix = DOKU_REL . DOKU_SCRIPT . '?';
                    $node['dw']['opening marks'] .= '[[';
                    if (0 === strpos($mark['attrs']['href'], $localPrefix)) {
                        // fixme: think about relative link handling
                        $node['dw']['inner'] = $mark['attrs']['title'];
                        $components = parse_url($mark['attrs']['href']); // fixme: think about 'useslash' and similar
                        if (!empty($components['query'])) {
                            parse_str(html_entity_decode($components['query']), $query);
                            unset($query['id']);
                            if (!empty($query)) {
                                $node['dw']['inner'] .= '?' . http_build_query($query);
                            }
                        }
                        $pageid = array_slice(explode(':', $mark['attrs']['title']), -1)[0];
                        if ($pageid !== $node['text']) {
                            $node['dw']['inner'] .= '|' . $node['text']; // fixme think about how to handle $conf['useheading']
                        }
                        // fixme: handle hash
                    } else {
                        // fixme: external link
                    }
                    $node['dw']['closing marks'][] = ']]';
                    break;
                default:
                    // fixme: event for plugin-marks?

            }
        }
//        print_r($node);
        return $node;
    }


    /**
     * [Custom event handler which performs action]
     *
     * @param Doku_Event $event  event object by reference
     * @param mixed      $param  [the parameters passed as fifth argument to register_hook() when this
     *                           handler was registered]
     *
     * @return void
     */
    public function handle_dokuwiki_started(Doku_Event $event, $param) {
    }

}

// vim:ts=4:sw=4:et:
