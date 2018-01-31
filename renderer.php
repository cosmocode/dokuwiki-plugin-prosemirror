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

    public function addToNodestackTop(Node $node)
    {
        $this->nodestack->addTop($node);
    }

    public function addToNodestack(Node $node)
    {
        $this->nodestack->add($node);
    }

    public function dropFromNodeStack($nodeType)
    {
        $this->nodestack->drop($nodeType);
    }

    public function getCurrentMarks()
    {
        return $this->marks;
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
    function quote_open()
    {
        $this->nodestack->addTop(new Node('quote'));
    }

    /** @inheritDoc */
    function quote_close()
    {
        if($this->nodestack->current()->getType() === 'paragraph') {
            $this->nodestack->drop('paragraph');
        }
        $this->nodestack->drop('quote');
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

        $parentNode = $this->nodestack->current()->getType();

        if (in_array($parentNode, ['paragraph', 'footnote'])) {
            $text = str_replace("\n", ' ', $text);
        }

        // list items need a paragraph before adding text
        if (in_array($parentNode, ['list_item', 'quote'])) {
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
        $node = new Node('preformatted');
        $this->nodestack->addTop($node);
        $this->cdata($text);
        $this->nodestack->drop('preformatted');
    }

    public function code($text, $lang = null, $file = null) { // FIXME add support for file and lang
        $node = new Node('code_block');
        $this->nodestack->addTop($node);
        $this->cdata(trim($text, "\n"));
        $this->nodestack->drop('code_block');
    }

    function footnote_open() {
        $footnoteNode = new Node('footnote');
        $this->nodestack->addTop($footnoteNode);
    }

    function footnote_close() {
        $this->nodestack->drop('footnote');
    }

    /**
     * @inheritDoc
     */
    function internalmedia($src, $title = null, $align = null, $width = null,
                           $height = null, $cache = null, $linking = null) {

        // FIXME how do we handle non-images, e.g. pdfs or audio?
        \dokuwiki\plugin\prosemirror\parser\ImageNode::render($this,
            $src,
            $title,
            $align,
            $width,
            $height,
            $cache,
            $linking
        );

    }

    /**
     * @inheritDoc
     */
    function externalmedia(
        $src,
        $title = null,
        $align = null,
        $width = null,
        $height = null,
        $cache = null,
        $linking = null
    ) {
        \dokuwiki\plugin\prosemirror\parser\ImageNode::render($this,
            $src,
            $title,
            $align,
            $width,
            $height,
            $cache,
            $linking
        );
    }


    public function locallink($hash, $name = null)
    {
        \dokuwiki\plugin\prosemirror\parser\LocalLinkNode::render($this, $hash, $name);
    }

    /**
     * @inheritDoc
     */
    public function internallink($id, $name = null)
    {
        \dokuwiki\plugin\prosemirror\parser\InternalLinkNode::render($this, $id, $name);
    }

    public function externallink($link, $title = null)
    {
        \dokuwiki\plugin\prosemirror\parser\ExternalLinkNode::render($this, $link, $title);
    }

    public function interwikilink($link, $title = null, $wikiName, $wikiUri)
    {
        \dokuwiki\plugin\prosemirror\parser\InterwikiLinkNode::render($this, $title, $wikiName, $wikiUri);
    }

    public function emaillink($address, $name = null)
    {
        \dokuwiki\plugin\prosemirror\parser\EmailLinkNode::render($this, $address, $name);
    }

    public function windowssharelink($link, $title = null)
    {
        \dokuwiki\plugin\prosemirror\parser\WindowsShareLinkNode::render($this, $link, $title);
    }

    /** @inheritDoc */
    function linebreak() {
        $this->nodestack->add(new Node('hard_break'));
    }

    /** @inheritDoc */
    function hr() {
        $this->nodestack->add(new Node('horizontal_rule'));
    }

    function plugin($name, $data, $state = '', $match = '') {
        if (empty($match)) {
            return;
        }
        $node = new Node('dwplugin');
        $node->attr('class', 'dwplugin');
        $node->attr('data-pluginname', $name);
        $this->nodestack->addTop($node);
        $this->cdata($match);
        $this->nodestack->drop('dwplugin');
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


    /** @inheritDoc */
    function unformatted($text)
    {
        $this->marks['unformatted'] = 1;
        parent::unformatted($text);
        unset($this->marks['unformatted']);
    }


    #endregion formatter marks

}

