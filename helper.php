<?php

use dokuwiki\plugin\prosemirror\parser\SyntaxTreeBuilder;
use dokuwiki\plugin\sentry\Event;

/**
 * DokuWiki Plugin prosemirror (Helper Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Andreas Gohr <gohr@cosmocode.de>
 */
class helper_plugin_prosemirror extends DokuWiki_Plugin
{

    /**
     * Decode json and parse the data back into DokuWiki Syntax
     *
     * @param string $unparsedJSON the json produced by Prosemirror
     *
     * @return null|string DokuWiki syntax or null on error
     */
    public function getSyntaxFromProsemirrorData($unparsedJSON)
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

    /**
     * Try to log an error to sentry if the sentry plugin exists
     *
     * @param Throwable $exception
     * @param array     $extraData associative array for sentries `extra` field
     *
     * @return bool true if the exception has been logged to sentry, false otherwise
     */
    public function tryToLogErrorToSentry(Throwable $exception, array $extraData = [])
    {
        global $ID;

        /** @var helper_plugin_sentry $sentry */
        $sentry = plugin_load('helper', 'sentry');
        if (!$sentry) {
            return false;
        }
        $sentryEvent = new Event([
            'extra' => $extraData,
            'tags' => [
                'plugin' => 'prosemirror',
                'id' => $ID,
            ],
        ]);
        $sentryEvent->addException($exception);
        $sentry->logEvent($sentryEvent);
        return true;
    }
}
// vim:ts=4:sw=4:et:
