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
        $controller->register_hook('ACTION_HEADERS_SEND', 'BEFORE', $this, 'forceWYSIWYG');
        $controller->register_hook('HTML_EDITFORM_OUTPUT', 'BEFORE', $this, 'addDataAndToggleButton');
        $controller->register_hook('TPL_ACT_RENDER', 'AFTER', $this, 'addAddtionalForms');
    }

    /**
     * If the current user is forced to use the WYSIWYG editor, set the cookie accordingly
     *
     * Triggered by event: ACTION_HEADERS_SEND
     *
     * @param Doku_Event $event
     * @param            $param
     */
    public function forceWYSIWYG(Doku_Event $event, $param)
    {
        if ($this->isForceWYSIWYG()) {
            set_doku_pref('plugin_prosemirror_useWYSIWYG', true);
        }
    }

    /**
     * Add the editor toggle button and, if using the WYSIWYG editor, the instructions rendered to json
     *
     * Triggered by event: HTML_EDITFORM_OUTPUT
     *
     * @param Doku_Event $event  event object
     * @param mixed      $param  [the parameters passed as fifth argument to register_hook() when this
     *                           handler was registered]
     *
     * @return void
     */
    public function addDataAndToggleButton(Doku_Event $event, $param)
    {
        if (!$this->allowWYSIWYG()) {
            return;
        }

        /** @var Doku_Form $form */
        $form =& $event->data;
        $useWYSIWYG = get_doku_pref('plugin_prosemirror_useWYSIWYG', false);

        $prosemirrorJSON = '';
        if ($useWYSIWYG) {
            global $TEXT;
            $instructions = p_get_instructions($TEXT);
            try {
                $prosemirrorJSON = p_render('prosemirror', $instructions, $info);
            } catch (Throwable $e) {
                $errorMsg = 'Rendering the page\'s syntax for the WYSIWYG editor failed: ' . $e->getMessage();

                /** @var \helper_plugin_prosemirror $helper */
                $helper = plugin_load('helper', 'prosemirror');
                if ($helper->tryToLogErrorToSentry($e, ['text' => $TEXT])) {
                    $errorMsg .= ' -- The error has been logged to Sentry.';
                }

                msg($errorMsg, -1);
                return;
            }
        }

        $form->addElement($this->buildToggleButton());

        // output data and editor field
        $form->addHidden('prosemirror_json',$prosemirrorJSON);
        $form->insertElement(1, '<div class="prosemirror_wrapper" id="prosemirror__editor"></div>');
    }

    /**
     * Create the button to toggle the WYSIWYG editor
     *
     * Creates it as hidden if forcing WYSIWYG
     *
     * @return array the pseudo-tag expected by \Doku_Form::addElement
     */
    protected function buildToggleButton()
    {
        $attr = [
            'class' => 'button plugin_prosemirror_useWYSIWYG'
        ];
        if ($this->isForceWYSIWYG()) {
            $attr['style'] = 'display: none;';
        }
        return form_makeButton('button', '', $this->getLang('switch_editors'), $attr);
    }

    /**
     * Determine if the current user is forced to use the WYSIWYG editor
     *
     * @return bool
     */
    protected function isForceWYSIWYG()
    {
        return $this->getConf('forceWYSIWYG') && !auth_ismanager();
    }

    /**
     * Forbid using WYSIWYG editor when editing anything else then sections or the entire page
     *
     * This would be the case for the edittable editor or the editor of the data plugin
     *
     * @return bool
     */
    protected function allowWYSIWYG()
    {
        global $INPUT;
        return !$INPUT->has('target') || $INPUT->str('target') === 'section';
    }

    public function addAddtionalForms(Doku_Event $event)
    {
        if (!$this->allowWYSIWYG()) {
            return;
        }

        if (!in_array($event->data, ['edit', 'preview'])) {
            return;
        }

        $linkForm = new dokuwiki\Form\Form([
            'class' => 'plugin_prosemirror_linkform',
            'id' => 'prosemirror-linkform',
            'style' => 'display: none;',
        ]);
        $linkForm->addFieldsetOpen('Links')->addClass('js-link-fieldset');;
        $iwOptions = array_keys(getInterwiki());
        $linkForm->addDropdown('iwshortcut', $iwOptions, 'InterWiki')->attr('required', 'required');

        $linkForm->addButton('linkwiz', '⛓️')->attrs([
            'type' => 'button',
            'class' => 'js-open-linkwiz linkform_linkwiz'
        ]);
        $linkForm->addTextInput('linktarget', $this->getLang('link target'))->attrs(
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
        $linkForm->addRadioButton('linktype', $this->getLang('type:wiki page'))->val('internallink');
        $linkForm->addRadioButton('linktype', $this->getLang('type:interwiki'))->val('interwikilink');
        $linkForm->addRadioButton('linktype', $this->getLang('type:email'))->val('emaillink');
        $linkForm->addRadioButton('linktype', $this->getLang('type:external'))->val('externallink')->attr('checked', 'checked');
        $linkForm->addRadioButton('linktype', $this->getLang('type:other'))->val('other');
        $linkForm->addTagClose('fieldset');
        $linkForm->addTagClose('div');

        $linkForm->addTagOpen('div')->addClass('radio-wrapper');
        $linkForm->addTagOpen('fieldset');
        $linkForm->addTagOpen('legend');
        $linkForm->addHTML('Link Name Type');
        $linkForm->addTagClose('legend');
        $linkForm->addRadioButton('nametype', $this->getLang('type:automatic title'))->val('automatic')->attr('checked', 'checked');
        $linkForm->addRadioButton('nametype', $this->getLang('type:custom title'))->val('custom');
        $linkForm->addRadioButton('nametype', $this->getLang('type:image'))->val('image');
        $linkForm->addTextInput('linkname', 'Link name')->attr('placeholder', $this->getLang('placeholder:link name'));
        $linkForm->addTagOpen('div')->addClass('js-media-wrapper');
        $linkForm->addTagClose('div');
        $linkForm->addTagClose('fieldset');
        $linkForm->addTagClose('div');


        $linkForm->addFieldsetClose();
        $linkForm->addButton('ok-button', 'OK')->attr('type', 'submit');
        $linkForm->addButton('cancel-button', $this->getLang('cancel'))->attr('type', 'button');

        echo $linkForm->toHTML();

        $mediaForm = new dokuwiki\Form\Form([
            'class' => 'plugin_prosemirror_mediaform',
            'id' => 'prosemirror-mediaform',
            'style' => 'display: none;',
        ]);
        $mediaForm->addFieldsetOpen($this->getLang('legend:media'))->addClass('js-media-fieldset');
        $mediaForm->addButton('mediamanager', '🖼️')->attrs([
            'type' => 'button',
            'class' => 'js-open-mediamanager mediaform_mediamanager'
        ]);
        $mediaForm->addTextInput('mediatarget', $this->getLang('media target'))->attrs(
            [
                'required'=> 'required',
                'autofocus' => 'autofocus',
            ]
        );
        $mediaForm->addTextInput('mediacaption', $this->getLang('label:caption'));
        $mediaForm->addTextInput('width', $this->getLang('label:width'))->attr('type', 'number');
        $mediaForm->addTextInput('height', $this->getLang('label:height'))->attr('type', 'number');

        $mediaForm->addTagOpen('div')->addClass('radio-wrapper');
        $mediaForm->addTagOpen('fieldset');
        $mediaForm->addTagOpen('legend');
        $mediaForm->addHTML($this->getLang('legend:alignment'));
        $mediaForm->addTagClose('legend');
        $mediaForm->addRadioButton('alignment', $this->getLang('label:default alignment'))->val('')->attr('checked', 'checked');
        $mediaForm->addRadioButton('alignment', $this->getLang('label:float left'))->val('left');
        $mediaForm->addRadioButton('alignment', $this->getLang('label:center alignment'))->val('center');
        $mediaForm->addRadioButton('alignment', $this->getLang('label:float right'))->val('right');
        $mediaForm->addTagClose('fieldset');
        $mediaForm->addTagClose('div');

        $mediaForm->addTagOpen('div')->addClass('radio-wrapper');
        $mediaForm->addTagOpen('fieldset');
        $mediaForm->addTagOpen('legend');
        $mediaForm->addHTML($this->getLang('legend:linking'));
        $mediaForm->addTagClose('legend');
        $mediaForm->addRadioButton('linking', $this->getLang('label:default linking'))->val('details')->attr('checked', 'checked');
        $mediaForm->addRadioButton('linking', $this->getLang('label:direct linking'))->val('direct');
        $mediaForm->addRadioButton('linking', $this->getLang('label:nolink'))->val('nolink');
        $mediaForm->addRadioButton('linking', $this->getLang('label:linkonly'))->val('linkonly');
        $mediaForm->addTagClose('fieldset');
        $mediaForm->addTagClose('div');

        $mediaForm->addTagOpen('div')->addClass('radio-wrapper');
        $mediaForm->addTagOpen('fieldset');
        $mediaForm->addTagOpen('legend');
        $mediaForm->addHTML($this->getLang('legend:caching'));
        $mediaForm->addTagClose('legend');
        $mediaForm->addRadioButton('caching', $this->getLang('label:default caching'))->val('')->attr('checked', 'checked');
        $mediaForm->addRadioButton('caching', $this->getLang('label:recache'))->val('recache');
        $mediaForm->addRadioButton('caching', $this->getLang('label:nocache'))->val('nocache');
        $mediaForm->addTagClose('fieldset');
        $mediaForm->addTagClose('div');

        $mediaForm->addFieldsetClose();
        $mediaForm->addButton('ok-button', 'OK')->attr('type', 'submit');
        $mediaForm->addButton('cancel-button', $this->getLang('cancel'))->attr('type', 'button');

        // dynamic image hack? https://www.dokuwiki.org/images#dynamic_images

        echo $mediaForm->toHTML();

        // phpcs:disable
        $languages = explode(' ', '4cs 6502acme 6502kickass 6502tasm 68000devpac abap actionscript3 actionscript ada aimms algol68 apache applescript apt_sources arm asm asp asymptote autoconf autohotkey autoit avisynth awk bascomavr bash basic4gl batch bf biblatex bibtex blitzbasic bnf boo caddcl cadlisp ceylon cfdg cfm chaiscript chapel cil c_loadrunner clojure c_mac cmake cobol coffeescript c cpp cpp-qt cpp-winapi csharp css cuesheet c_winapi dart dcl dcpu16 dcs delphi diff div dos dot d ecmascript eiffel email epc e erlang euphoria ezt f1 falcon fo fortran freebasic freeswitch fsharp gambas gdb genero genie gettext glsl gml gnuplot go groovy gwbasic haskell haxe hicest hq9plus html html4strict html5 icon idl ini inno intercal io ispfpanel java5 java javascript jcl j jquery julia kixtart klonec klonecpp kotlin latex lb ldif lisp llvm locobasic logtalk lolcode lotusformulas lotusscript lscript lsl2 lua m68k magiksf make mapbasic mathematica matlab mercury metapost mirc mk-61 mmix modula2 modula3 mpasm mxml mysql nagios netrexx newlisp nginx nimrod nsis oberon2 objc objeck ocaml-brief ocaml octave oobas oorexx oracle11 oracle8 oxygene oz parasail parigp pascal pcre perl6 perl per pf phix php-brief php pic16 pike pixelbender pli plsql postgresql postscript povray powerbuilder powershell proftpd progress prolog properties providex purebasic pycon pys60 python qbasic qml q racket rails rbs rebol reg rexx robots rpmspec rsplus ruby rust sas sass scala scheme scilab scl sdlbasic smalltalk smarty spark sparql sql standardml stonescript swift systemverilog tclegg tcl teraterm texgraph text thinbasic tsql twig typoscript unicon upc urbi uscript vala vbnet vb vbscript vedit verilog vhdl vim visualfoxpro visualprolog whitespace whois winbatch xbasic xml xojo xorg_conf xpp yaml z80 zxbasic');
        // phpcs:enable
        $datalistHTML = '<datalist id="codelanguages">';
        foreach ($languages as $language) {
            $datalistHTML .= "<option value=\"$language\">";
        }
        $datalistHTML .= '</datalist>';
        echo $datalistHTML;
    }
}

// vim:ts=4:sw=4:et:
