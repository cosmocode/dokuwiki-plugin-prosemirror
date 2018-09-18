<?php

namespace dokuwiki\plugin\prosemirror\schema;

class NodeStack
{

    /** @var Node[] */
    protected $stack = [];

    /** @var int index to the top of the stack */
    protected $stacklength = -1;

    /** @var Node the root node */
    protected $doc;

    /**
     * NodeStack constructor.
     */
    public function __construct()
    {
        $node = new Node('doc');
        $this->doc = $node;
        $this->top($node);
    }

    /**
     * @return Node
     */
    public function getDocNode()
    {
        return $this->stack[0];
    }

    /**
     * Get the current node (the one at the top of the stack)
     *
     * @return Node
     */
    public function current()
    {
        return $this->stack[$this->stacklength];
    }

    /**
     * Get the document (top most level) node
     *
     * @return Node
     */
    public function doc()
    {
        return $this->doc;
    }

    /**
     * Make the given node the current one
     *
     * @param Node $node
     */
    protected function top(Node $node)
    {
        $this->stack[] = $node;
        $this->stacklength++;
    }

    /**
     * Add a new child node to the current node and make it the new current node
     *
     * @param Node $node
     */
    public function addTop(Node $node)
    {
        $this->add($node);
        $this->top($node);
    }

    /**
     * Pop the current node off the stack
     *
     * @param string $type The type of node that is expected. A RuntimeException is thrown if the current nod does not
     *                     match
     *
     * @return Node
     */
    public function drop($type)
    {
        /** @var Node $node */
        $node = array_pop($this->stack);
        $this->stacklength--;
        if ($node->getType() != $type) {
            throw new \RuntimeException("Expected the current node to be of type $type found " . $node->getType() . " instead.");
        }
        return $node;
    }

    /**
     * Add a new child node to the current node
     *
     * @param Node $node
     */
    public function add(Node $node)
    {
        $this->current()->addChild($node);
    }

    /**
     * Check if there have been any nodes added to the document
     */
    public function isEmpty()
    {
        return !$this->doc->hasContent();
    }
}
