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

    /** @var Node the document node,*/
    public $docnode;

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
        $this->docnode = new Node('doc');
        $this->current = $this->docnode;
    }

    /** @inheritDoc */
    function document_end() {
        $this->doc = json_encode($this->docnode, JSON_PRETTY_PRINT);
    }

    /** @inheritDoc */
    function p_open() {
        $node = new Node('paragraph');
        $this->docnode->addChild($node);
        $this->current = $node;
    }

    /** @inheritdoc */
    function p_close() {
        $this->current = $this->docnode;
    }

    /** @inheritDoc */
    function header($text, $level, $pos) {
        $node = new Node('heading');
        $node->attr('level', $level);

        $tnode = new Node('text');
        $tnode->setText($text);
        $node->addChild($tnode);

        $this->docnode->addChild($node);
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
        $this->marks['em'] = 1;
    }

    /** @inheritDoc */
    function emphasis_close() {
        if(isset($this->marks['em'])) unset($this->marks['em']);
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

    /**
     * @inheritDoc
     * @fixme this implementation is much too naive. we'll probably need our own node types for internal/external/interwiki and have more attributes
     */
    function internallink($link, $title = null) {
        $title = $this->_simpleTitle($link);

        $node = new Node('text');
        $node->setText($title);

        $mark = new Mark('link');
        $mark->attr('href', $link);
        $mark->attr('title', $link);

        $node->addMark($mark);

        $this->current->addChild($node);
    }

}

