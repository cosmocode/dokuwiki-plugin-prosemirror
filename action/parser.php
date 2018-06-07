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
        $controller->register_hook('COMMON_DRAFT_SAVE', 'BEFORE', $this, 'handle_draft');
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
        $syntax = $this->getSyntaxFromProsemirrorData($unparsedJSON);
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
            $errorMsg = 'Error decoding prosemirror data ' . json_last_error_msg();

            /** @var helper_plugin_sentry $sentry */
            $sentry = plugin_load('helper', 'sentry');
            if ($sentry) {
                $event = new Event(['extra' => ['json' => $unparsedJSON]]);
                $exception = new ErrorException($errorMsg); // ToDo: create unique prosemirror exceptions?
                $event->addException($exception);
                $sentry->logEvent($event);

                $errorMsg .= ' Error has been logged to Sentry.';
            }

            msg($errorMsg, -1);
            return null;
        }
        try {
            $rootNode = SyntaxTreeBuilder::parseDataIntoTree($prosemirrorData);
        } catch (Throwable $e) {
            $errorMsg = 'Parsing the data provided by the WYSIWYG editor failed with message: ' . hsc($e->getMessage());
            /** @var helper_plugin_sentry $sentry */
            $sentry = plugin_load('helper', 'sentry');
            if ($sentry) {
                $sentry->logException($e);
                $errorMsg .= ' Error has been logged to Sentry.';
            }

            msg($errorMsg, -1);
            return null;
        }
        $syntax = $rootNode->toSyntax();
        return $syntax;
    }
}

// vim:ts=4:sw=4:et:
