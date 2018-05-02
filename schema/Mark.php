<?php

namespace dokuwiki\plugin\prosemirror\schema;

/**
 * Class Mark
 *
 * @package dokuwiki\plugin\prosemirror\schema
 * @link    http://prosemirror.net/ref.html#model.Mark
 */
class Mark implements \JsonSerializable
{

    /** @var  string The type of this mark */
    protected $type;

    /** @var array The attributes associated with this mark */
    protected $attrs = [];

    /**
     * Mark constructor.
     *
     * @param string $type
     */
    public function __construct($type)
    {
        $this->type = $type;
    }

    /**
     * @param string $key   Attribute key to get or set
     * @param null   $value Attribute value to set, null to get
     *
     * @return $this|mixed Either the wanted value or the Mark itself
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
        if ($this->attrs) {
            $json['attrs'] = $this->attrs;
        }

        return $json;
    }
}
