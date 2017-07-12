<?php
/**
 * DokuWiki Plugin prosemirror (Action Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Andreas Gohr <gohr@cosmocode.de>
 */

// must be run within Dokuwiki
if(!defined('DOKU_INC')) die();

class action_plugin_prosemirror extends DokuWiki_Action_Plugin {

    /**
     * Registers a callback function for a given event
     *
     * @param Doku_Event_Handler $controller DokuWiki's event controller object
     * @return void
     */
    public function register(Doku_Event_Handler $controller) {
       $controller->register_hook('HTML_EDITFORM_OUTPUT', 'BEFORE', $this, 'output_editor');
    }

    /**
     * [Custom event handler which performs action]
     *
     * @param Doku_Event $event  event object
     * @param mixed      $param  [the parameters passed as fifth argument to register_hook() when this
     *                           handler was registered]
     * @return void
     */
    public function output_editor(Doku_Event $event, $param) {
        global $TEXT;

        // fixme: somehow make sure that we want to actually use the editor
        if (!$this->getConf('use_editor')) {
            msg('prosemirror editor deactivated in conf', 0);
            return;
        }
        msg('prosemirror editor active!', 2);

        $event->stopPropagation();
        $event->preventDefault();

        $instructions = p_get_instructions($TEXT);

        // output data and editor field

        /** @var Doku_Form $form */
        $form =& $event->data;

        // data for handsontable
        $form->addHidden('prosemirror_json', p_render('prosemirror', $instructions, $info));
        $form->insertElement(1, '<div id="prosemirror__editor"></div>');
    }
}

// vim:ts=4:sw=4:et:
