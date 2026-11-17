<?php

use dokuwiki\Extension\Plugin;
use dokuwiki\plugin\prosemirror\parser\SyntaxTreeBuilder;
use dokuwiki\plugin\sentry\Event;

/**
 * DokuWiki Plugin prosemirror (Helper Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Andreas Gohr <gohr@cosmocode.de>
 */
class helper_plugin_prosemirror extends Plugin
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
     * Wrapper around p_get_instructions
     *
     * `hr` could have been written in different ways, so the instruction gets arguments for the renderer
     * with exact markup extracted from the $doc and flags about blank lines before and after.
     *
     * @param string $text wiki syntax
     * @return array the instructions
     */
    public function getInstructions($text)
    {
        $instructions = p_get_instructions($text);

        // instruction positions refer to the text as padded by dokuwiki\Parsing\Parser::parse()
        // and as changed by PARSER_WIKITEXT_PREPROCESS handlers, which $text doesn't include.
        // If such a change moved the positions, the rule isn't found and keeps the defaults.
        $doc = "\n" . str_replace("\r\n", "\n", $text) . "\n";
        foreach ($instructions as &$instruction) {
            if ($instruction[0] !== 'hr') continue;
            $pos = $instruction[2];
            // the rule's line, in any accepted syntax
            if (!preg_match('/\G\n(-{3,}|\*{3,}|_{3,})(?=\n)/', $doc, $match, 0, $pos)) continue;
            // arguments for renderer_plugin_prosemirror::hr()
            $instruction[1] = [
                (bool)preg_match('/\n[ \t]*$/', substr($doc, 0, $pos)), // blank line before?
                (bool)preg_match('/\A\n[ \t]*\n/', substr($doc, $pos + strlen($match[0]))), // blank line after?
                $match[1], // markup
            ];
        }
        unset($instruction);

        return $instructions;
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
