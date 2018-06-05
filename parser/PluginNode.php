<?php

namespace dokuwiki\plugin\prosemirror\parser;

class PluginNode extends Node implements InlineNodeInterface
{

    protected $textNode;

    public function __construct($data, Node $parent, Node $previous = null)
    {
        $this->textNode = new TextNode($data['content'][0], $this, $previous);
    }

    public function toSyntax()
    {
        return $this->textNode->toSyntax();
    }

    /**
     * @param string $markType
     */
    public function increaseMark($markType)
    {
        return $this->textNode->increaseMark($markType);
    }

    public function getStartingNodeMarkScore($markType)
    {
        return $this->textNode->getStartingNodeMarkScore($markType);
    }
}
