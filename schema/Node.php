<?php

namespace dokuwiki\plugin\prosemirror\schema;

/**
 * Class Node
 *
 * @package dokuwiki\plugin\prosemirror\schema
 * @link    http://prosemirror.net/ref.html#model.Node
 */
class Node implements \JsonSerializable
{

    /** @var  string The type of node that this is */
    protected $type;

    /** @var  Node[] holding the node's children */
    protected $content = [];

    /** @var  string For text nodes, this contains the node's text content. */
    protected $text = null;

    /** @var Mark[] The marks (things like whether it is emphasized or part of a link) associated with this node */
    protected $marks = [];

    /** @var array list of attributes */
    protected $attrs = [];

    /**
     * Node constructor.
     *
     * @param string $type
     */
    public function __construct($type)
    {
        $this->type = $type;
        if ($type == 'text') {
            $this->setText('');
        }
    }

    /**
     * @param Node $child
     */
    public function addChild(Node $child)
    {
        if ($this->type == 'text') {
            throw new \RuntimeException('TextNodes may not have children');
        }
        $this->content[] = $child;
    }

    /**
     * @param Mark $mark
     */
    public function addMark(Mark $mark)
    {
        $this->marks[] = $mark;
    }

    /**
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @return string
     */
    public function getText()
    {
        return $this->text;
    }

    /**
     * @param string $text
     */
    public function setText($text)
    {
        if ($this->type != 'text') {
            throw new \RuntimeException('Non-TextNodes may not have text');
        }
        $this->text = $text;
    }

    /**
     * @param string $key   Attribute key to get or set
     * @param null   $value Attribute value to set, null to get
     *
     * @return $this|mixed Either the wanted value or the Node itself
     */
    public function attr($key, $value = null)
    {
        if (is_null($value)) {
            if (isset($this->attrs[$key])) {
                return $this->attrs[$key];
            } else {
                return null;
            }
        }

        $this->attrs[$key] = $value;
        return $this;
    }

    /**
     * Specify data which should be serialized to JSON
     *
     * @link  http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     * which is a value of any type other than a resource.
     * @since 5.4.0
     */
    function jsonSerialize()
    {
        $json = [
            'type' => $this->type,
        ];
        if ($this->type == 'text') {
            $json['text'] = $this->text;
        } elseif ($this->content) {
            $json['content'] = $this->content;
        }

        if ($this->marks) {
            $json['marks'] = $this->marks;
        }
        if ($this->attrs) {
            $json['attrs'] = $this->attrs;
        }

        return $json;
    }

    /**
     * Check if any child nodes have been added to this node
     *
     * @return bool
     */
    public function hasContent() {
        return !empty($this->content);
    }

    /**
     * Trim all whitespace from the beginning of this node's content
     *
     * If this is a text-node then this node's text is left-trimmed
     *
     * If the first node in the content is afterwards only an empty string, then it is removed
     *
     * @return void
     */
    public function trimContentLeft() {
        if ($this->hasContent()) {
            $this->content[0]->trimContentLeft();
            if ($this->content[0]->getText() === '') {
                array_shift($this->content);
            }
            return;
        }
        if ($this->text !== null) {
            $this->text = ltrim($this->text);
        }
    }

    /**
     * Trim all whitespace from the end of this node's content
     *
     * If this is a text-node then this node's text is right-trimmed
     *
     * If the last node in the content is afterwards only an empty string, then it is removed
     *
     * @return void
     */
    public function trimContentRight() {
        if ($this->hasContent()) {
            $contentLength = count($this->content) - 1;
            $this->content[$contentLength]->trimContentRight();
            if ($this->content[$contentLength]->getText() === '') {
                array_pop($this->content);
            }
            return;
        }
        if ($this->text !== null) {
            $this->text = rtrim($this->text);
        }
    }
}
