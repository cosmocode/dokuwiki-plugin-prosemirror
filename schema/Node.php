<?php

namespace dokuwiki\plugin\prosemirror\schema;

/**
 * Class Node
 * @package dokuwiki\plugin\prosemirror\schema
 * @link http://prosemirror.net/ref.html#model.Node
 */
class Node implements \JsonSerializable {

    /** @var  string The type of node that this is */
    protected $type;

    /** @var  Node[] holding the node's children */
    protected $content = [];

    /** @var  string For text nodes, this contains the node's text content. */
    protected $text = null;

    /** @var Mark[] The marks (things like whether it is emphasized or part of a link) associated with this node */
    protected $marks = [];

    /**
     * Node constructor.
     *
     * @param string $type
     */
    public function __construct($type) {
        $this->type = $type;
    }

    /**
     * @param Node $child
     */
    public function addChild(Node $child) {
        if($this->type == 'text') throw new \RuntimeException('TextNodes may not have children');
        $this->content[] = $child;
    }

    /**
     * @param Mark $mark
     */
    public function addMark(Mark $mark) {
        $this->marks[] = $mark;
    }

    /**
     * @return string
     */
    public function getType() {
        return $this->type;
    }

    /**
     * @return string
     */
    public function getText() {
        return $this->text;
    }

    /**
     * @param string $text
     */
    public function setText($text) {
        if($this->type != 'text') throw new \RuntimeException('text can only be set on text nodes');
        $this->text = $text;
    }

    /**
     * Specify data which should be serialized to JSON
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     * which is a value of any type other than a resource.
     * @since 5.4.0
     */
    function jsonSerialize() {
        $json = array(
            'type' => $this->type
        );
        if($this->type == 'text') {
            $json['text'] = $this->text;
        } else {
            $json['content'] = $this->content;
        }
        if($this->marks) {
            $json['marks'] = $this->marks;
        }

        return $json;
    }
}
