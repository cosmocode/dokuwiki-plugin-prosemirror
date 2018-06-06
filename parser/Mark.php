<?php

namespace dokuwiki\plugin\prosemirror\parser;

class Mark
{

    public static $markOrder = [
        'strong' => 1,
        'underline' => 2,
        'em' => 3,
        'code' => 4,
        'subscript' => 5,
        'superscript' => 6,
        'deleted' => 7,
        'unformatted' => 99,
    ];

    protected $type;
    protected $attrs;

    protected $tailLength = 0;

    /** @var  Mark */
    protected $previousMark = null;

    /** @var  Mark */
    protected $nextMark = null;

    /** @var  TextNode */
    protected $parent;

    public function __construct($data, &$parent)
    {
        $this->type = $data['type'];
        if (isset($data['attrs'])) {
            $this->attrs = $data['attrs'];
        }
        $this->parent = &$parent;
    }

    public function setPrevious($previousMark)
    {
        $this->previousMark = &$previousMark;
    }

    public function setNext($nextMark)
    {
        $this->nextMark = &$nextMark;
    }

    public function isOpeningMark()
    {
        return $this->parent->getStartingNodeMarkScore($this->type) === $this->getTailLength();
    }

    public function isClosingMark()
    {
        return $this->tailLength === 0;
    }

    public function incrementTail()
    {
        $this->tailLength += 1;
    }

    public function getTailLength()
    {
        return $this->tailLength;
    }

    public function getType()
    {
        return $this->type;
    }

    /**
     * @param Mark      $newPrevious
     * @param null|Mark $newNext
     *
     * @return Mark
     */
    public function switchPlaces(Mark $newPrevious, $newNext)
    {
        $oldPrevious = $this->previousMark;
        $this->previousMark = &$newPrevious;
        $this->nextMark = &$newNext;
        if (null !== $newNext) {
            $newNext->setPrevious($this);
        }
        return $oldPrevious;
    }

    public function sort()
    {
        if ($this->previousMark === null) {
            return true;
        }
        if ($this->previousMark->getTailLength() > $this->tailLength) {
            // the marks that ends later must be printed in front of those that end earlier
            return true;
        }
        if ($this->previousMark->getTailLength() === $this->tailLength) {
            if (self::$markOrder[$this->previousMark->getType()] < self::$markOrder[$this->type]) {
                return true;
            }
        }

        $newPrevious = $this->previousMark->switchPlaces($this, $this->nextMark);
        $this->nextMark = &$this->previousMark;
        $this->previousMark = &$newPrevious;
        if (null !== $newPrevious) {
            $newPrevious->setNext($this);
        }

        return false;
    }

    public function getFirst()
    {
        if (!$this->previousMark) {
            return $this;
        }
        return $this->previousMark->getFirst();
    }

    public function getLast()
    {
        if (!$this->nextMark) {
            return $this;
        }
        return $this->nextMark->getLast();
    }

    public function getPrevious()
    {
        return $this->previousMark;
    }

    public function getNext()
    {
        return $this->nextMark;
    }

    protected static $openingMarks = [
        'strong' => '**',
        'em' => '//',
        'underline' => '__',
        'code' => '\'\'',
        'subscript' => '<sub>',
        'superscript' => '<sup>',
        'deleted' => '<del>',
    ];

    protected static $closingMarks = [
        'strong' => '**',
        'em' => '//',
        'underline' => '__',
        'code' => '\'\'',
        'subscript' => '</sub>',
        'superscript' => '</sup>',
        'deleted' => '</del>',
    ];

    public function getOpeningSyntax()
    {
        if ($this->type !== 'unformatted') {
            return self::$openingMarks[$this->type];
        }
        return $this->getUnformattedSyntax('opening');
    }

    public function getClosingSyntax()
    {
        if ($this->type !== 'unformatted') {
            return self::$closingMarks[$this->type];
        }

        return $this->getUnformattedSyntax('closing');
    }

    /**
     * Handle the edge case that %% is wrapped in nowiki syntax
     *
     * @param string $type 'opening' or 'closing'
     *
     * @return string
     */
    protected function getUnformattedSyntax($type)
    {
        if (strpos($this->parent->getInnerSyntax(), '%%') === false) {
            return '%%';
        }
        if ($type === 'opening') {
            return '<nowiki>';
        }
        return '</nowiki>';
    }
}
