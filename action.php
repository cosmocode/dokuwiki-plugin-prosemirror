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
        if (!$INPUT->post->has('prosemirror_data')) {
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

        return implode("\n", array_reduce($json['content'], [$this, 'buildNodeTree'], []));
    }

    public function buildNodeTree($lines, $node) {
        switch ($node['type']) {
            case 'paragraph':
                return array_merge($lines, $this->parseParagraphNode($node));
            case 'bullet_list':
                return array_merge($lines, $this->parseList($node));
            case 'text':
                return array_merge($lines, $this->parseTextNode($node));
            default:
                // fixme: trigger plugin event?
        }
        return $lines;
    }

    public function parseList($node) {
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
        return array_reduce($node['content'], [$this, 'buildNodeTree'], []);
    }

    public function parseTextNode($node) {
        $prefix = '';
        $postfix = '';
        $insertNodeText = true;
        if (!isset($node['marks'])) {
            return [trim($node['text'])];
        }
        foreach ($node['marks'] as $mark) {
            switch ($mark['type']) {
                case 'strong':
                    $prefix .= '**';
                    $postfix .= '**';
                    break;
                case 'link':
                    $localPrefix = DOKU_REL . DOKU_SCRIPT . '?';
                    $prefix .= '[[';
                    $insertNodeText = false;
                    if (0 === strpos($mark['attrs']['href'], $localPrefix)) {
                        // fixme: think about relative link handling
                        $page = $mark['attrs']['title'];
                        $pageid = array_slice(explode(':', $mark['attrs']['title']), -1)[0];
                        $components = parse_url($mark['attrs']['href']); // fixme: think about 'useslash' and similar
                        if (!empty($components['query'])) {
                            parse_str(html_entity_decode($components['query']), $query);
                            unset($query['id']);
                            if (!empty($query)) {
                                $page .= '?' . http_build_query($query);
                            }
                        }
                        $prefix .= $page;
                        if ($pageid !== $node['text']) {
                            $prefix .= '|' . $node['text']; // fixme think about how to handle $conf['useheading']
                        }
                        // fixme: handle hash
                    } else {
                        // external link
                    }
                    $postfix .= ']]';
                    break;
                default:
                    // fixme: event for plugin-marks?

            }
        }
        return [trim($prefix . ($insertNodeText ? $node['text'] : '') . $postfix)];
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
