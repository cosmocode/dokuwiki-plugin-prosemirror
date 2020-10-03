<?php

namespace dokuwiki\plugin\prosemirror\parser;

class TextNode extends Node implements InlineNodeInterface
{

    /** @var  TextNode */
    public $previous = null;

    /** @var  Node */
    protected $parent;

    /** @var Mark[] */
    protected $marks = [];

    protected $text = '';

    public function __construct($data, Node $parent, Node $previous = null)
    {
        $this->parent = &$parent;
        if ($previous !== false) {
            $this->previous = &$previous;
        }

        $this->text = $data['text'];
        if (isset($data['marks'])) {
            $this->setMarks($data['marks']);
        }
    }

    public function getPrefixSyntax()
    {
        $doc = '';

        /** @var Mark[] $openingMarks */
        $openingMarks = [];
        foreach ($this->marks as $mark) {
            if ($mark->isOpeningMark()) {
                $previousOpeningMark = end($openingMarks);
                if ($previousOpeningMark) {
                    $mark->setPrevious($previousOpeningMark);
                    $previousOpeningMark->setNext($mark);
                }
                $openingMarks[] = $mark;
            }
        }

        if (!empty($openingMarks)) {
            foreach ($openingMarks as $mark) {
                while (!$mark->sort()) {
                }
            }

            $mark = $openingMarks[0]->getFirst();
            $doc .= $mark->getOpeningSyntax();
            while ($mark = $mark->getNext()) {
                $doc .= $mark->getOpeningSyntax();
            }

            foreach ($openingMarks as $mark) {
                $mark->setNext(null);
                $mark->setPrevious(null);
            }
        }
        return $doc;
    }

    public function getPostfixSyntax()
    {
        $doc = '';
        /** @var Mark[] $closingMarks */
        $closingMarks = [];
        foreach ($this->marks as $mark) {
            if ($mark->isClosingMark()) {
                $previousClosingMark = end($closingMarks);
                if ($previousClosingMark) {
                    $mark->setPrevious($previousClosingMark);
                    $previousClosingMark->setNext($mark);
                }
                $closingMarks[] = $mark;
            }
        }

        if (!empty($closingMarks)) {
            foreach ($closingMarks as $mark) {
                while (!$mark->sort()) {
                }
            }

            $mark = $closingMarks[0]->getLast();
            $doc .= $mark->getClosingSyntax();
            while ($mark = $mark->getPrevious()) {
                $doc .= $mark->getClosingSyntax();
            }

            foreach ($closingMarks as $mark) {
                $mark->setNext(null);
                $mark->setPrevious(null);
            }
        }

        return $doc;
    }

    public function getInnerSyntax()
    {
        return $this->text;
    }


    public function toSyntax()
    {
        $prefix = $this->getPrefixSyntax();
        $inner = $this->getInnerSyntax();
        $postfix = $this->getPostfixSyntax();
        return $prefix . $inner . $postfix;
    }

    /**
     * @param array $marks
     *
     * @return $this
     * @throws \Exception
     */
    protected function setMarks(array $marks)
    {
        foreach ($marks as $markData) {
            $currentMark = new Mark($markData, $this);
            $type = $currentMark->getType();
            $this->marks[$type] = $currentMark;
            if ($this->previous !== null) {
                $this->previous->increaseMark($type);
            }
        }
        return $this;
    }

    /**
     * @param string $markType
     */
    public function increaseMark($markType)
    {
        if (!isset($this->marks[$markType])) {
            return;
        }

        $this->marks[$markType]->incrementTail();
        if ($this->previous !== null) {
            $this->previous->increaseMark($markType);
        }
    }

    public function getStartingNodeMarkScore($markType)
    {
        if ($this === $this->previous) {
            throw new \Exception('circular reference: ' . $this->text);
        }
        if (!isset($this->marks[$markType])) {
            // we don't have that mark
            return null;
        }
        if ($this->previous === null) {
            // we are the first node
            return $this->marks[$markType]->getTailLength();
        }

        $earlierMarkScore = $this->previous->getStartingNodeMarkScore($markType);
        if ($earlierMarkScore === null) {
            // the mark begins with us
            return $this->marks[$markType]->getTailLength();
        }
        return $earlierMarkScore;
    }
}
