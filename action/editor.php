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

class action_plugin_prosemirror_editor extends DokuWiki_Action_Plugin
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
        $controller->register_hook('HTML_EDITFORM_OUTPUT', 'BEFORE', $this, 'output_editor');
        $controller->register_hook('TPL_ACT_RENDER', 'AFTER', $this, 'addAddtionalForms');
    }

    /**
     * [Custom event handler which performs action]
     *
     * @param Doku_Event $event  event object
     * @param mixed      $param  [the parameters passed as fifth argument to register_hook() when this
     *                           handler was registered]
     *
     * @return void
     */
    public function output_editor(Doku_Event $event, $param)
    {
        global $INPUT;

        /** @var Doku_Form $form */
        $form =& $event->data;
        $useWYSIWYG = get_doku_pref('plugin_prosemirror_useWYSIWYG', false);

        if (!$useWYSIWYG) {
            $attr = [
                'class' => 'button plugin_prosemirror_useWYSIWYG'
            ];
            $form->addElement(form_makeButton('submit', 'preview', 'Preview and use WYSIWYG-Editor', $attr));
            return;
        }

        $event->stopPropagation();
        $event->preventDefault();

        $attr = [
            'class' => 'button plugin_prosemirror_useWYSIWYG'
        ];
        $form->addElement(form_makeButton('submit', 'preview', 'Preview and use Syntax-Editor', $attr));


        global $TEXT;
        $instructions = p_get_instructions($TEXT);

        // output data and editor field
        $form->addHidden('prosemirror_json', p_render('prosemirror', $instructions, $info));
        $form->insertElement(1, '<div id="prosemirror__editor"></div>');
    }

    public function addAddtionalForms(Doku_Event $event)
    {
        if (!in_array($event->data, ['edit', 'preview'])) {
            return;
        }

        $linkForm = new dokuwiki\Form\Form(['class' => 'plugin_prosemirror_linkform', 'id' => 'prosemirror-linkform']);
        $linkForm->addFieldsetOpen('Links')->addClass('js-link-fieldset');;
        $iwOptions = array_keys(getInterwiki());
        $linkForm->addDropdown('iwshortcut', $iwOptions, 'InterWiki')->attr('required', 'required');
        $linkForm->addTextInput('linktarget', 'Link target')->attrs(
            [
            'required'=> 'required',
            'autofocus' => 'autofocus',
            ]
        );

        $linkForm->addTagOpen('div')->addClass('radio-wrapper');
        $linkForm->addTagOpen('fieldset');
        $linkForm->addTagOpen('legend');
        $linkForm->addHTML('Link Type');
        $linkForm->addTagClose('legend');
        $linkForm->addRadioButton('linktype', 'Wiki page')->val('internallink');
        $linkForm->addRadioButton('linktype', 'Interwiki')->val('interwikilink');
        $linkForm->addRadioButton('linktype', 'email')->val('emaillink');
        $linkForm->addRadioButton('linktype', 'external')->val('externallink')->attr('checked', 'checked');
        $linkForm->addRadioButton('linktype', 'Other')->val('other');
        $linkForm->addTagClose('fieldset');
        $linkForm->addTagClose('div');

        $linkForm->addTagOpen('div')->addClass('radio-wrapper');
        $linkForm->addTagOpen('fieldset');
        $linkForm->addTagOpen('legend');
        $linkForm->addHTML('Link Name Type');
        $linkForm->addTagClose('legend');
        $linkForm->addRadioButton('nametype', 'automatic')->val('automatic')->attr('checked', 'checked');
        $linkForm->addRadioButton('nametype', 'custom')->val('custom');
        $linkForm->addRadioButton('nametype', 'image')->val('image');
        $linkForm->addTextInput('linkname', 'Link name')->attr('placeholder', '(automatic)');
        $linkForm->addTagOpen('div')->addClass('js-media-wrapper');
        $linkForm->addTagClose('div');
        $linkForm->addTagClose('fieldset');
        $linkForm->addTagClose('div');


        $linkForm->addFieldsetClose();
        $linkForm->addButton('ok-button', 'OK')->attr('type', 'submit');
        $linkForm->addButton('cancel-button', 'Cancel')->attr('type', 'button');

        echo $linkForm->toHTML();

        $mediaForm = new dokuwiki\Form\Form(
            ['class' => 'plugin_prosemirror_mediaform', 'id' => 'prosemirror-mediaform']
        );
        $mediaForm->addFieldsetOpen('Media')->addClass('js-media-fieldset');
        $mediaForm->addTextInput('mediatarget', 'Media')->attrs(
            [
                'required'=> 'required',
                'autofocus' => 'autofocus',
            ]
        );
        $mediaForm->addTextInput('mediacaption', 'Caption');
        $mediaForm->addTextInput('width', 'Width (px)')->attr('type', 'number');
        $mediaForm->addTextInput('height', 'Height (px)')->attr('type', 'number');

        $mediaForm->addTagOpen('div')->addClass('radio-wrapper');
        $mediaForm->addTagOpen('fieldset');
        $mediaForm->addTagOpen('legend');
        $mediaForm->addHTML('Alignment');
        $mediaForm->addTagClose('legend');
        $mediaForm->addRadioButton('alignment', 'default')->val('')->attr('checked', 'checked');
        $mediaForm->addRadioButton('alignment', 'float left')->val('left');
        $mediaForm->addRadioButton('alignment', 'center')->val('center');
        $mediaForm->addRadioButton('alignment', 'float right')->val('right');
        $mediaForm->addTagClose('fieldset');
        $mediaForm->addTagClose('div');

        $mediaForm->addTagOpen('div')->addClass('radio-wrapper');
        $mediaForm->addTagOpen('fieldset');
        $mediaForm->addTagOpen('legend');
        $mediaForm->addHTML('Linking');
        $mediaForm->addTagClose('legend');
        $mediaForm->addRadioButton('linking', 'default')->val('details')->attr('checked', 'checked');
        $mediaForm->addRadioButton('linking', 'direct')->val('direct');
        $mediaForm->addRadioButton('linking', 'nolink')->val('nolink');
        $mediaForm->addRadioButton('linking', 'linkonly')->val('linkonly');
        $mediaForm->addTagClose('fieldset');
        $mediaForm->addTagClose('div');

        $mediaForm->addTagOpen('div')->addClass('radio-wrapper');
        $mediaForm->addTagOpen('fieldset');
        $mediaForm->addTagOpen('legend');
        $mediaForm->addHTML('Caching');
        $mediaForm->addTagClose('legend');
        $mediaForm->addRadioButton('caching', 'default')->val('')->attr('checked', 'checked');
        $mediaForm->addRadioButton('caching', 'recache')->val('recache');
        $mediaForm->addRadioButton('caching', 'nocache')->val('nocache');
        $mediaForm->addTagClose('fieldset');
        $mediaForm->addTagClose('div');

        $mediaForm->addFieldsetClose();
        $mediaForm->addButton('ok-button', 'OK')->attr('type', 'submit');
        $mediaForm->addButton('cancel-button', 'Cancel')->attr('type', 'button');

        // dynamic image hack? https://www.dokuwiki.org/images#dynamic_images

        echo $mediaForm->toHTML();
    }
}

// vim:ts=4:sw=4:et:
