<?php

/**
 * DokuWiki Plugin prosemirror (Action Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Andreas Gohr <gohr@cosmocode.de>
 */

use dokuwiki\Extension\ActionPlugin;
use dokuwiki\Extension\EventHandler;
use dokuwiki\Extension\Event;
use dokuwiki\plugin\prosemirror\parser\ImageNode;
use dokuwiki\plugin\prosemirror\parser\RSSNode;
use dokuwiki\plugin\prosemirror\parser\LocalLinkNode;
use dokuwiki\plugin\prosemirror\parser\InternalLinkNode;
use dokuwiki\plugin\prosemirror\parser\LinkNode;

class action_plugin_prosemirror_ajax extends ActionPlugin
{
    /**
     * Registers a callback function for a given event
     *
     * @param EventHandler $controller DokuWiki's event controller object
     *
     * @return void
     */
    public function register(EventHandler $controller)
    {
        $controller->register_hook('AJAX_CALL_UNKNOWN', 'BEFORE', $this, 'handleAjax');
        $controller->register_hook('AJAX_CALL_UNKNOWN', 'BEFORE', $this, 'switchEditors');
    }

    /**
     * [Custom event handler which performs action]
     *
     * Event: AJAX_CALL_UNKNOWN
     *
     * @param Event $event event object by reference
     *
     * @return void
     */
    public function handleAjax(Event $event)
    {
        if ($event->data !== 'plugin_prosemirror') {
            return;
        }
        $event->preventDefault();
        $event->stopPropagation();

        global $INPUT, $ID;
        $ID = $INPUT->str('id');
        $responseData = [];
        foreach ($INPUT->arr('actions') as $action) {
            switch ($action) {
                case 'resolveInternalLink':
                    $inner = $INPUT->str('inner');
                    $responseData[$action] = $this->resolveInternalLink($inner, $ID);
                    break;
                case 'resolveInterWikiLink':
                    $inner = $INPUT->str('inner');
                    [$shortcut, $reference] = explode('>', $inner);
                    $responseData[$action] = $this->resolveInterWikiLink($shortcut, $reference);
                    break;
                case 'resolveMedia':
                    $attrs = $INPUT->arr('attrs');
                    $responseData[$action] = [
                        'data-resolvedHtml' => ImageNode::resolveMedia(
                            $attrs['id'],
                            $attrs['title'],
                            $attrs['align'],
                            $attrs['width'],
                            $attrs['height'],
                            $attrs['cache'],
                            $attrs['linking']
                        )
                    ];
                    break;
                case 'resolveImageTitle':
                    $image = $INPUT->arr('image');
                    $responseData[$action] = [];
                    $responseData[$action]['data-resolvedImage'] = LinkNode::resolveImageTitle(
                        $ID,
                        $image['id'],
                        $image['title'],
                        $image['align'],
                        $image['width'],
                        $image['height'],
                        $image['cache']
                    );
                    break;
                case 'resolveRSS':
                    $attrs = json_decode($INPUT->str('attrs'), true);
                    $responseData[$action] = RSSNode::renderAttrsToHTML($attrs);
                    break;
                default:
                    dokuwiki\Logger::getInstance(dokuwiki\Logger::LOG_DEBUG)->log(
                        __FILE__ . ': ' . __LINE__,
                        'Unknown action: ' . $action
                    );
                    http_status(400, 'unknown action');
                    return;
            }
        }

        header('Content-Type: application/json');
        echo json_encode($responseData);
    }

    protected function resolveInterWikiLink($shortcut, $reference)
    {
        $xhtml_renderer = p_get_renderer('xhtml');
        $xhtml_renderer->interwiki = getInterwiki();
        $url = $xhtml_renderer->_resolveInterWiki($shortcut, $reference, $exits);
        return [
            'url' => $url,
            'resolvedClass' => 'interwikilink interwiki iw_' . $shortcut,
        ];
    }

    protected function resolveInternalLink($inner, $curId)
    {
        if ($inner[0] === '#') {
            return LocalLinkNode::resolveLocalLink($inner, $curId);
        }
        return InternalLinkNode::resolveLink($inner, $curId);
    }

    /**
     * [Custom event handler which performs action]
     *
     * Event: AJAX_CALL_UNKNOWN
     *
     * @param Event $event event object by reference
     *
     * @return void
     */
    public function switchEditors(Event $event)
    {
        if ($event->data !== 'plugin_prosemirror_switch_editors') {
            return;
        }
        $event->preventDefault();
        $event->stopPropagation();

        global $INPUT;

        if ($INPUT->bool('getJSON')) {
            $text = $INPUT->str('data');
            $instructions = p_get_instructions($text);
            try {
                $prosemirrorJSON = p_render('prosemirror', $instructions, $info);
            } catch (Throwable $e) {
                $errorMsg = 'Rendering the page\'s syntax for the WYSIWYG editor failed: ';
                $errorMsg .= $e->getMessage();

                /** @var \helper_plugin_prosemirror $helper */
                $helper = plugin_load('helper', 'prosemirror');
                if ($helper->tryToLogErrorToSentry($e, ['text' => $text])) {
                    $errorMsg .= ' -- The error has been logged to Sentry.';
                } else {
                    $errorMsg .= '<code>' . $e->getFile() . ':' . $e->getLine() . '</code>';
                    $errorMsg .= '<pre>' . $e->getTraceAsString() . '</pre>';
                }

                http_status(500);
                header('Content-Type: application/json');
                echo json_encode(['error' => $errorMsg]);
                return;
            }
            $responseData = [
                'json' => $prosemirrorJSON,
            ];
        } else {
            /** @var \helper_plugin_prosemirror $helper */
            $helper = plugin_load('helper', 'prosemirror');
            $json = $INPUT->str('data');
            try {
                $syntax = $helper->getSyntaxFromProsemirrorData($json);
            } catch (Throwable $e) {
                $errorMsg = 'Parsing the data generated by Prosemirror failed with message: "';
                $errorMsg .= $e->getMessage();
                $errorMsg .= '"';

                if ($helper->tryToLogErrorToSentry($e, ['json' => $json])) {
                    $errorMsg .= ' -- The error has been logged to Sentry.';
                }

                http_status(500);
                header('Content-Type: application/json');
                echo json_encode(['error' => $errorMsg]);
                return;
            }
            $responseData = [
                'text' => $syntax,
            ];
        }

        header('Content-Type: application/json');
        echo json_encode($responseData);
    }
}
