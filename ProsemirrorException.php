<?php

namespace dokuwiki\plugin\prosemirror;

/**
 * Class ProsemirrorException
 *
 * A translatable exception
 *
 * @package dokuwiki\plugin\prosemirror
 */
class ProsemirrorException extends \RuntimeException {
    public $data = [];

    /**
     * @param string $key
     * @param mixed $data
     */
    public function addExtraData($key, $data)
    {
        $this->data[$key] = $data;
    }

    public function getExtraData()
    {
        return $this->data;
    }
}
