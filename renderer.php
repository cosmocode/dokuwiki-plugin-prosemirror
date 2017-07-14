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

    /** @var int column counter for table handling */
    protected $colcount = 0;

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

    #region lists

    /** @inheritDoc */
    function listu_open() {
        if($this->nodestack->current()->getType() == 'paragraph') {
            $this->nodestack->drop('paragraph');
        }

        $this->nodestack->addTop(new Node('bullet_list'));
    }

    /** @inheritDoc */
    function listu_close() {
        $this->nodestack->drop('bullet_list');
    }

    /** @inheritDoc */
    function listo_open() {
        if($this->nodestack->current()->getType() == 'paragraph') {
            $this->nodestack->drop('paragraph');
        }

        $this->nodestack->addTop(new Node('ordered_list'));
    }

    /** @inheritDoc */
    function listo_close() {
        $this->nodestack->drop('ordered_list');
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

    #endregion lists

    #region table

    /** @inheritDoc */
    function table_open($maxcols = null, $numrows = null, $pos = null) {
        $this->nodestack->addTop(new Node('table'));
    }

    /** @inheritDoc */
    function table_close($pos = null) {
        $this->nodestack->drop('table');
    }

    /** @inheritDoc */
    function tablerow_open() {
        $this->nodestack->addTop(new Node('table_row'));
        $this->colcount = 0;
    }

    /** @inheritDoc */
    function tablerow_close() {
        $node = $this->nodestack->drop('table_row');
        $node->attr('columns', $this->colcount);
    }

    /** @inheritDoc */
    function tablecell_open($colspan = 1, $align = null, $rowspan = 1) {
        $this->colcount += $colspan;

        $node = new Node('table_cell');
        $node->attr('is_header', false);
        $node->attr('colspan', $colspan);
        $node->attr('rowspan', $rowspan);
        $node->attr('align', $rowspan);
        $this->nodestack->addTop($node);
    }

    /** @inheritdoc */
    function tablecell_close() {
        $this->nodestack->drop('table_cell');
    }

    /** @inheritDoc */
    function tableheader_open($colspan = 1, $align = null, $rowspan = 1) {
        $this->colcount += $colspan;

        $node = new Node('table_cell');
        $node->attr('is_header', true);
        $node->attr('colspan', $colspan);
        $node->attr('rowspan', $rowspan);
        $node->attr('align', $rowspan);
        $this->nodestack->addTop($node);
    }

    /** @inheritdoc */
    function tableheader_close() {
        $this->nodestack->drop('table_cell');
    }

    #endregion table

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

    public function preformatted($text) {
        $node = new Node('code_block');
        $this->nodestack->addTop($node);
        $textNode = new Node('text');
        $textNode->setText($text);
        $this->nodestack->add($textNode);
        $this->nodestack->drop('code_block');
    }

    /**
     * @fixme we probably want one function to handle all images
     * @inheritDoc
     */
    function internalmedia($src, $title = null, $align = null, $width = null,
                           $height = null, $cache = null, $linking = null) {

        // FIXME null values need to be initialized with the correct defaults

        $node = new Node('image');
        $node->attr('src', ml($src));
        $node->attr('title', $title);

        // FIXME these need to be implemented in the schema
        $node->attr('id', $src);
        $node->attr('align', $align);
        $node->attr('width', $width);
        $node->attr('height', $height);
        $node->attr('cache', $cache);
        $node->attr('linking', $linking);

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

    public function externallink($link, $title = null) {
        if (null === $title) {
            $title = $link;
        }
        $node = new Node('text');
        $node->setText($title);

        $mark = new Mark('link');
        $mark->attr('href', $link);
        $mark->attr('title', $link);

        $node->addMark($mark);

        $this->nodestack->add($node);
    }

    public function interwikilink($link, $title = null, $wikiName, $wikiUri) {
        $isImage = false;
        if (null === $title) {
            $title = $wikiUri;
        } elseif (is_array($title)) {
            $isImage = true;
        }

        $shortcut = $wikiName;
        $url    = $this->_resolveInterWiki($shortcut, $wikiUri, $exists);
        $iwLinkNode = new Node('interwikilink');
        $iwLinkNode->attr('href', $url);
        $iwLinkNode->attr('data-shortcut', hsc($wikiName));
        $iwLinkNode->attr('data-reference', hsc($wikiUri));
        $iwLinkNode->attr('title', $url);
        $iwLinkNode->attr('class', 'interwikilink iw iw-' . $shortcut);
        $this->nodestack->addTop($iwLinkNode);

        $textNode = new Node('text');
        $textNode->setText($title);
        $this->nodestack->add($textNode);
        $this->nodestack->drop('interwikilink');
    }

    /** @inheritDoc */
    function linebreak() {
        $this->nodestack->add(new Node('hard_break'));
    }

    /** @inheritDoc */
    function hr() {
        $this->nodestack->add(new Node('horizontal_rule'));
    }

    #region elements with no special WYSIWYG representation

    /** @inheritDoc */
    function entity($entity) {
        $this->cdata($entity); // FIXME should we handle them special?
    }

    /** @inheritDoc */
    function multiplyentity($x, $y) {
        $this->cdata($x . 'x' . $y);
    }

    /** @inheritDoc */
    function acronym($acronym) {
        $this->cdata($acronym);
    }

    /** @inheritDoc */
    function apostrophe() {
        $this->cdata("'");
    }

    /** @inheritDoc */
    function singlequoteopening() {
        $this->cdata("'");
    }

    /** @inheritDoc */
    function singlequoteclosing() {
        $this->cdata("'");
    }

    /** @inheritDoc */
    function doublequoteopening() {
        $this->cdata('"');
    }

    /** @inheritDoc */
    function doublequoteclosing() {
        $this->cdata('"');
    }

    /** @inheritDoc */
    function camelcaselink($link) {
        $this->cdata($link); // FIXME should/could we decorate it?
    }

    #endregion

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

