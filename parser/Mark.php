<?php

namespace dokuwiki\plugin\prosemirror\parser;

class Mark {

    public static $markOrder = [
        'link' => 0,
        'strong' => 1,
        'underline' => 2,
        'em' => 3,
        'code' => 4,
//        '<sub>' => 5,
//        '</sub>' => 5,
//        '<sup>' => 6,
//        '</sup>' => 6,
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

    public function __construct($data, &$parent) {
//        print_r($type);
        $this->type = $data['type'];
        if (isset($data['attrs'])) {
            $this->attrs = $data['attrs'];
        }
        $this->parent = &$parent;
    }

    public function setPrevious($previousMark) {
        $this->previousMark = &$previousMark;
    }

    public function setNext($nextMark) {
        $this->nextMark = &$nextMark;
    }

    public function isOpeningMark() {
        if ($this->type === 'link') {
            return true;
        }
        return $this->parent->getStartingNodeMarkScore($this->type) === $this->getTailLength();
    }

    public function isClosingMark() {
        if ($this->type === 'link') {
            return true;
        }
        return $this->tailLength === 0;
    }

    public function incrementTail() {
        $this->tailLength += 1;
    }

    public function getTailLength() {
        return $this->tailLength;
    }

    public function getType() {
        return $this->type;
    }

    public function switchPlaces(&$newPrevious, &$newNext) {
        $oldPrevious = $this->previousMark;
        $this->previousMark = &$newPrevious;
        $this->nextMark = &$newNext;
        return $oldPrevious;
    }

    public function sort() {
        if ($this->previousMark === null) {
            return true;
        }
        if ($this->previousMark->getTailLength() < $this->tailLength) {
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

        return false;
    }

    public function getFirst() {
        if (!$this->previousMark) {
            return $this;
        }
        return $this->previousMark->getFirst();
    }

    public function getLast() {
        if (!$this->nextMark) {
            return $this;
        }
        return $this->nextMark->getLast();
    }

    public function getPrevious() {
        return $this->previousMark;
    }

    public function getNext() {
        return $this->nextMark;
    }

    protected static $openingMarks = [
        'strong' => '**',
        'em' => '//',
        'underline' => '__',
        'code' => '\'\'',
        'link' => '[[',
    ];

    protected static $closingMarks = [
        'strong' => '**',
        'em' => '//',
        'underline' => '__',
        'code' => '\'\'',
        'link' => ']]',
    ];

    public function getOpeningSyntax() {
        return self::$openingMarks[$this->type];
    }

    public function getClosingSyntax() {
        return self::$closingMarks[$this->type];
    }

    public function transformInner($text) {
        switch ($this->type) {
            case 'link':
                $localPrefix = DOKU_REL . DOKU_SCRIPT . '?';
                if (0 === strpos($this->attrs['href'], $localPrefix)) {
                    // fixme: think about relative link handling
                    $inner = $this->attrs['title'];
                    $components = parse_url($this->attrs['href']); // fixme: think about 'useslash' and similar
                    if (!empty($components['query'])) {
                        parse_str(html_entity_decode($components['query']), $query);
                        unset($query['id']);
                        if (!empty($query)) {
                            $inner .= '?' . http_build_query($query);
                        }
                    }
                    $pageid = array_slice(explode(':', $this->attrs['title']), -1)[0];
                    if ($pageid !== $text) {
                        $inner .= '|' . $text; // fixme think about how to handle $conf['useheading']
                    }
                    // fixme: handle hash
                } else {
                    $inner = $text;
                    // fixme: external link
                }
                return $inner;
            default:
                // fixme: event for plugin-marks?
                return $text;

        }
    }


}
