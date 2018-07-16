<?php
/**
 * DokuWiki Plugin prosemirror (Action Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Andreas Gohr <gohr@cosmocode.de>
 */

// must be run within Dokuwiki
use dokuwiki\plugin\prosemirror\parser\SyntaxTreeBuilder;

if (!defined('DOKU_INC')) {
    die();
}

class action_plugin_prosemirror_parser extends DokuWiki_Action_Plugin
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
        $controller->register_hook('ACTION_ACT_PREPROCESS', 'BEFORE', $this, 'handle_preprocess');
        $controller->register_hook('DRAFT_SAVE', 'BEFORE', $this, 'handle_draft');
    }

    /**
     * Triggered by: COMMON_DRAFT_SAVE
     *
     * @param Doku_Event $event
     * @param            $param
     */
    public function handle_draft(Doku_Event $event, $param)
    {
        global $INPUT;
        $unparsedJSON = $INPUT->post->str('prosemirror_json');
        if (empty($unparsedJSON)) {
            return;
        }


        /** @var \helper_plugin_prosemirror $helper */
        $helper = plugin_load('helper', 'prosemirror');

        try {
            $syntax = $helper->getSyntaxFromProsemirrorData($unparsedJSON);
        } catch (\Throwable $e) {
            $event->preventDefault();
            $event->stopPropagation();

            $errorMsg = $e->getMessage();

            if ($helper->tryToLogErrorToSentry($e, ['json' => $unparsedJSON])) {
                $errorMsg .= ' -- The error has been logged to Sentry.';
            }

            $event->data['errors'][] = $errorMsg;
            return;
        }

        $event->data['text'] = $syntax;
    }

    /**
     * [Custom event handler which performs action]
     *
     * Triggered by: ACTION_ACT_PREPROCESS
     *
     * @param Doku_Event $event  event object by reference
     * @param mixed      $param  [the parameters passed as fifth argument to register_hook() when this
     *                           handler was registered]
     *
     * @return void
     */
    public function handle_preprocess(Doku_Event $event, $param)
    {
        global $TEXT, $INPUT;
        if ($INPUT->server->str('REQUEST_METHOD') !== 'POST'
            || !in_array($event->data, ['save', 'preview'])
            || !$INPUT->post->has('prosemirror_json')
            || !get_doku_pref('plugin_prosemirror_useWYSIWYG', false)
        ) {
            return;
        }

        $unparsedJSON = $INPUT->post->str('prosemirror_json');

        /** @var \helper_plugin_prosemirror $helper */
        $helper = plugin_load('helper', 'prosemirror');
        try {
            $syntax = $helper->getSyntaxFromProsemirrorData($unparsedJSON);
        } catch (\Throwable $e) {
            $event->preventDefault();
            $event->stopPropagation();

            $errorMsg = $e->getMessage();

            if ($helper->tryToLogErrorToSentry($e, ['json' => $unparsedJSON])) {
                $errorMsg .= ' -- The error has been logged to Sentry.';
            }

            msg($errorMsg, -1);
            return;
        }
        if ($syntax !== null) {
            $TEXT = trim($syntax);
        }
    }

}

// vim:ts=4:sw=4:et:
