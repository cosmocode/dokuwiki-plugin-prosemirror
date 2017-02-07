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
use dokuwiki\plugin\prosemirror\schema\NodeStack;

if(!defined('DOKU_INC')) die();

require_once DOKU_INC . 'inc/parser/renderer.php';

class renderer_plugin_prosemirror extends Doku_Renderer {

    /** @var  NodeStack */
    protected $nodestack;

    /** @var array list of currently active formatting marks */
    protected $marks = array();

    /**
     * The format this renderer produces
     */
    public function getFormat() {
        return 'prosemirror';
    }

    // FIXME implement all methods of Doku_Renderer here

    /** @inheritDoc */
    function document_start() {
        $this->nodestack = new NodeStack();
    }

    /** @inheritDoc */
    function document_end() {
        $this->doc = json_encode($this->nodestack->doc(), JSON_PRETTY_PRINT);
    }

    /** @inheritDoc */
    function p_open() {
        $this->nodestack->addTop(new Node('paragraph'));
    }

    /** @inheritdoc */
    function p_close() {
        $this->nodestack->drop('paragraph');
    }

    /** @inheritDoc */
    function listu_open() {
        $this->nodestack->addTop(new Node('bullet_list'));
    }

    /** @inheritDoc */
    function listu_close() {
        $this->nodestack->drop('bullet_list');
    }

    /** @inheritDoc */
    function listitem_open($level, $node = false) {
        $this->nodestack->addTop(new Node('list_item'));
    }

    /** @inheritDoc */
    function listitem_close() {
        if($this->nodestack->current()->getType() == 'paragraph') {
            $this->nodestack->drop('paragraph');
        }
        $this->nodestack->drop('list_item');
    }

    /** @inheritDoc */
    function header($text, $level, $pos) {
        $node = new Node('heading');
        $node->attr('level', $level);

        $tnode = new Node('text');
        $tnode->setText($text);
        $node->addChild($tnode);

        $this->nodestack->add($node);
    }

    /** @inheritDoc */
    function cdata($text) {
        if($text === '') return;

        // list items need a paragraph before adding text
        if($this->nodestack->current()->getType() == 'list_item') {
            $node = new Node('paragraph'); // FIXME we probably want a special list item wrapper here instead
            $this->nodestack->addTop($node);
        }

        $node = new Node('text');
        $node->setText($text);
        foreach(array_keys($this->marks) as $mark) {
            $node->addMark(new Mark($mark));
        }
        $this->nodestack->add($node);
    }

    /**
     * @inheritDoc
     * @fixme this implementation is much too naive. we'll probably need our own node types for internal/external/interwiki and have more attributes
     */
    function internallink($link, $title = null) {
        $params = '';
        $parts = explode('?', $link, 2);
        if(count($parts) === 2) {
            $link = $parts[0];
            $params = $parts[1];
        }

        if(!$title) {
            $title = $this->_simpleTitle($link);
        }

        $node = new Node('text');
        $node->setText($title);

        $mark = new Mark('link');
        $mark->attr('href', wl($link, $params));
        $mark->attr('title', $link);

        $node->addMark($mark);

        $this->nodestack->add($node);
    }

    /**
     * @inheritDoc
     */
    function linebreak() {
        $this->nodestack->add(new Node('hard_break'));
    }

    #region formatter marks

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

    /** @inheritdoc */
    function subscript_open() {
        $this->marks['subscript'] = 1;
    }

    /** @inheritDoc */
    function subscript_close() {
        if(isset($this->marks['subscript'])) unset($this->marks['subscript']);
    }

    /** @inheritdoc */
    function superscript_open() {
        $this->marks['superscript'] = 1;
    }

    /** @inheritDoc */
    function superscript_close() {
        if(isset($this->marks['superscript'])) unset($this->marks['superscript']);
    }

    /** @inheritDoc */
    function monospace_open() {
        $this->marks['code'] = 1;
    }

    /** @inheritDoc */
    function monospace_close() {
        if(isset($this->marks['code'])) unset($this->marks['code']);
    }

    /** @inheritDoc */
    function deleted_open() {
        $this->marks['deleted'] = 1;
    }

    /** @inheritDoc */
    function deleted_close() {
        if(isset($this->marks['deleted'])) unset($this->marks['deleted']);
    }

    /** @inheritDoc */
    function underline_open() {
        $this->marks['underline'] = 1;
    }

    /** @inheritDoc */
    function underline_close() {
        if(isset($this->marks['underline'])) unset($this->marks['underline']);
    }

    #endregion formatter marks

}

