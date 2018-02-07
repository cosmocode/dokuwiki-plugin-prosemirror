<?php
/**
 * DokuWiki Plugin prosemirror (Action Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Andreas Gohr <gohr@cosmocode.de>
 */

// must be run within Dokuwiki
if(!defined('DOKU_INC')) die();

class action_plugin_prosemirror_editor extends DokuWiki_Action_Plugin {

    /**
     * Registers a callback function for a given event
     *
     * @param Doku_Event_Handler $controller DokuWiki's event controller object
     * @return void
     */
    public function register(Doku_Event_Handler $controller) {
        $controller->register_hook('HTML_EDITFORM_OUTPUT', 'BEFORE', $this, 'output_editor');
        $controller->register_hook('TPL_ACT_RENDER', 'AFTER', $this, 'addAddtionalForms');
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

    public function addAddtionalForms(Doku_Event $event)
    {
        if (!in_array($event->data, ['edit', 'preview'])) {
            return;
        }
        $linkForm = '
<form class="plugin_prosemirror_linkform" id="prosemirror-linkform">
    <fieldset>
        <label for="prosemirror-linktarget-input">Link target</label>
        <input type="text" id="prosemirror-linktarget-input"/>
        <label for="prosemirror-linkname-input">Link name</label>
        <input type="text" id="prosemirror-linkname-input" placeholder="(automatic)"/>
        <button type="submit" class="plugin_prosemirror_linkform__ok_button" name="ok-button">OK</button>
        <button type="button" class="plugin_prosemirror_linkform__cancel_button" name="cancel-button">Cancel</button>
    </fieldset>
</form>
        ';
        echo $linkForm;
    }
}

// vim:ts=4:sw=4:et:
