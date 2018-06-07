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
        ) {
            return;
        }

        $unparsedJSON = $INPUT->post->str('prosemirror_json');
        if (json_decode($unparsedJSON, true) === null) {
            msg('Error decoding prosemirror data', -1);
            return;
        }
        try {
            $rootNode = SyntaxTreeBuilder::parseJsonIntoTree($unparsedJSON);
        } catch (Throwable $e) {
            $errorMsg = 'Parsing the data provided by the WYSIWYG editor failed with message: ' . hsc($e->getMessage());
            /** @var helper_plugin_sentry $sentry */
            $sentry = plugin_load('helper', 'sentry');
            if ($sentry) {
                $sentry->logException($e);
                $errorMsg .= ' Error has been logged to Sentry.';
            }

            msg($errorMsg, -1);
            return;
        }
        $syntax = $rootNode->toSyntax();
        if (!empty($syntax)) {
            $TEXT = $syntax;
        }
    }
}

// vim:ts=4:sw=4:et:
