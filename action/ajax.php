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

class action_plugin_prosemirror_ajax extends DokuWiki_Action_Plugin
{
    /**
     * Registers a callback function for a given event
     *
     * @param Doku_Event_Handler $controller DokuWiki's event controller object
     *
     * @return void
     */
    public function register(Doku_Event_Handler $controller)
    {
        $controller->register_hook('AJAX_CALL_UNKNOWN', 'BEFORE', $this, 'handleAjax');
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
    public function handleAjax(Doku_Event $event, $param)
    {
        if ($event->data !== 'plugin_prosemirror') {
            return;
        }
        $event->preventDefault();
        $event->stopPropagation();

        global $INPUT;
        switch ($INPUT->str('action')) {
            case 'resolveLink':
                {
                    $inner = $INPUT->str('inner');
                    $ns = $INPUT->str('ns');
                    echo json_encode($this->resolveLink($inner, $ns));
                    break;
                }
            default:
                {
                    dbglog('Unknown action: ' . $INPUT->str('action'), __FILE__ . ': ' . __LINE__);
                    http_status(400, 'unknown action');
                }
        }
    }

    protected function resolveLink($inner, $ns)
    {
        dbglog($ns, __FILE__ . ': ' . __LINE__);

        $params = '';
        $parts  = explode('?', $inner, 2);
        $resolvedPageId = $parts[0];
        if(count($parts) === 2) {
            $params = $parts[1];
        }

        $xhtml_renderer = p_get_renderer('xhtml');
        $default = $xhtml_renderer->_simpleTitle($inner);
        resolve_pageid($ns, $resolvedPageId, $exists);

        if(useHeading('content')) {
            $heading = p_get_first_heading($resolvedPageId);
        }
        if (empty($heading)) {
            $heading = $default;
        }

        $url = wl($resolvedPageId, $params);

        return [
            'id' => $resolvedPageId,
            'exists' => $exists,
            'heading' => $heading,
            'url' => $url,
        ];
    }
}
