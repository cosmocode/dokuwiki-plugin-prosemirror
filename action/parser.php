<?php
/**
 * DokuWiki Plugin prosemirror (Action Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Andreas Gohr <gohr@cosmocode.de>
 */

// must be run within Dokuwiki
use dokuwiki\plugin\prosemirror\parser\SyntaxTreeBuilder;
use dokuwiki\plugin\sentry\Event;

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
        try {
            $syntax = $this->getSyntaxFromProsemirrorData($unparsedJSON);
        } catch (\Throwable $e) {
            $event->preventDefault();
            $event->stopPropagation();

            $errorMsg = $e->getMessage();

            /** @var helper_plugin_sentry $sentry */
            $sentry = plugin_load('helper', 'sentry');
            if ($sentry) {
                $sentryEvent = new Event(['extra' => ['json' => $unparsedJSON]]);
                $sentryEvent->addException($e);
                $sentry->logEvent($sentryEvent);

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
            || ($event->data !== 'save' && $event->data !== 'preview')
            || !$INPUT->post->has('prosemirror_json')
        ) {
            return;
        }
        $unparsedJSON = $INPUT->post->str('prosemirror_json');
        $syntax = $this->getSyntaxFromProsemirrorData($unparsedJSON);
        if (!empty($syntax)) {
            $TEXT = $syntax;
        }
    }

    /**
     * Decode json and parse the data back into DokuWiki Syntax
     *
     * @param string $unparsedJSON the json produced by Prosemirror
     *
     * @return null|string DokuWiki syntax or null on error
     */
    protected function getSyntaxFromProsemirrorData($unparsedJSON)
    {
        $prosemirrorData = json_decode($unparsedJSON, true);
        if ($prosemirrorData === null) {
            $errorMsg = 'Error decoding prosemirror json ' . json_last_error_msg();
            throw new RuntimeException($errorMsg);
        }

        $rootNode = SyntaxTreeBuilder::parseDataIntoTree($prosemirrorData);
        $syntax = $rootNode->toSyntax();
        return $syntax;
    }
}

// vim:ts=4:sw=4:et:
