<?php
/**
 * DokuWiki Plugin prosemirror (Renderer Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Andreas Gohr <gohr@cosmocode.de>
 */

// must be run within Dokuwiki
use dokuwiki\plugin\prosemirror\schema\Mark;
use dokuwiki\plugin\prosemirror\schema\Node;

if (!defined('DOKU_INC')) die();

require_once DOKU_INC.'inc/parser/renderer.php';

class renderer_plugin_prosemirror extends Doku_Renderer {

    /** @var Node the document node*/
    public $doc;

    /** @var  Node the node we're currently appending to */
    protected $current;

    /** @var array list of currently active formatting marks */
    protected $marks = array();

    /**
     * The format this renderer produces
     */
    public function getFormat(){
        return 'prosemirror';
    }

    // FIXME implement all methods of Doku_Renderer here

    /** @inheritDoc */
    function document_start() {
        $this->doc = new Node('doc');
        $this->current = $this->doc;
    }

    /** @inheritDoc */
    function p_open() {
        $node = new Node('paragraph');
        $this->doc->addChild($node);
        $this->current = $node;
    }

    /** @inheritdoc */
    function p_close() {
        $this->current = $this->doc;
    }


    /** @inheritDoc */
    function strong_open() {
        $this->marks['strong'] = 1;
    }

    /** @inheritDoc */
    function strong_close() {
        if(isset($this->marks['strong'])) unset($this->marks['strong']);
    }

    /** @inheritDoc */
    function emphasis_open() {
        $this->marks['emphasis'] = 1;
    }

    /** @inheritDoc */
    function emphasis_close() {
        if(isset($this->marks['emphasis'])) unset($this->marks['emphasis']);
    }

    /** @inheritDoc */
    function cdata($text) {
        if($text === '') return;

        $node = new Node('text');
        $node->setText($text);
        foreach(array_keys($this->marks) as $mark) {
            $node->addMark(new Mark($mark));
        }
        $this->current->addChild($node);
    }

}

